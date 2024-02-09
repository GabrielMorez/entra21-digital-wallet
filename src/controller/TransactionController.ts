import { AppDataSource } from "../data-source";
import { Currency } from "../model/Currency";
import { WalletTransaction } from "../model/Transaction";
import axios from "axios";
import { TransactionDTO } from "../dto/TransactionDTO";
import { CurrencyDTO } from "../dto/CurrencyDTO";
import { ConvertCurrencyException } from "../exceptions/ConvertCurrencyException";
import { InsufficientFundsException } from "../exceptions/InsufficientFundsException";
import { WalletDTO } from "../dto/WalletDTO";
import { Wallet } from "../model/Wallet";
import moment from "moment";
import { TransactionSevenDaysAgo } from "../exceptions/TransactionSevenDaysAgo";
import { TransactionNotFound } from "../exceptions/TransactionNotFound";
import { TransactionIsRefunded } from "../exceptions/TransactionIsRefunded";

type currencyQuote = {
  from: string,
  to: string,
  bid: number,
}

export class WalletTransactionController {
  
  async getStatements() {
    const transactionRepository = AppDataSource.getRepository(WalletTransaction);
    const statementList = await transactionRepository.find({
      relations: {
        currency: true,
        wallet: true
      },
      order: {
        createdAt: "DESC"
      },
    });
    return statementList.map((transaction: WalletTransaction) => TransactionDTO.fromModel(transaction))
  }

  async getStatementByUser(userId: number) {    
    const transactionRepository = AppDataSource.getRepository(WalletTransaction);
    const statementList = await transactionRepository.find({
      relations: {
        currency: true,
        wallet: {
          user: true,
          currency: true
        }
      },
      where: {
        wallet: {
          user: {
            id: userId
          }
        }
      },
      order: {
        createdAt: "DESC"
      },
    });    

    return statementList.map((transaction: WalletTransaction) => TransactionDTO.fromModel(transaction))
  }

  async getStatementByUserAndCurrency(userId: number, currencyId: number) {
    const transactionRepository = AppDataSource.getRepository(WalletTransaction);
    const statementList = await transactionRepository.find({
      relations: {
        currency: true,
        wallet: true
      },
      where: {
        wallet: {
          user: {
            id: userId
          },
          currency: {
            id: currencyId
          }
        }
      },
      order: {
        createdAt: "DESC"
      },
    })

    return statementList.map((transaction: WalletTransaction) => TransactionDTO.fromModel(transaction))
  }

  async getStatementInCurrency(userId: number, currencyId: number) {
    const transactionRepository = AppDataSource.getRepository(WalletTransaction);
    const statementList = await transactionRepository.find({
      select: {
        amount: true,
        isCredit: true,
        currency: { id: true, acronym: true }
      },
      relations: {
        currency: true
      },
      where: {
        wallet: {
          user: {
            id: userId
          }
        }
      }
    })
    const amountList = [];
    const currencyRepository = AppDataSource.getRepository(Currency);
    const inCurrency = CurrencyDTO.fromModel(await currencyRepository.findOneBy({id : currencyId}))    

    for (let i = 0; i < statementList.length; i++) {
      if(statementList[i].isCredit){
        const statement = statementList[i];
        
        let amountInCurrency = await convertCurrencys(CurrencyDTO.fromModel(statement.currency), inCurrency, statement.amount)
      
        amountList.push(amountInCurrency)
      }

      if(!(statementList[i].isCredit)){
        const statement = statementList[i];

        let amountInCurrency = await convertCurrencys(CurrencyDTO.fromModel(statement.currency), inCurrency, statement.amount) * -1
      
        amountList.push(amountInCurrency)
      }
    }
    
    let statementInCurrency: WalletTransaction = {
      id: undefined,
      wallet: undefined,
      amountBRL: undefined,
      isCredit: undefined,
      isRefunded: undefined,
      createdAt: undefined,
      amount: amountList.reduce((a, b)=> a + b , 0),
      currency: inCurrency,
      refundedAt: undefined,
    }    

    return TransactionDTO.fromModelWithSum(statementInCurrency)
  }

  async createTransaction(transactionDTO: TransactionDTO) {
      const transactionRepository = AppDataSource.getRepository(WalletTransaction)
      const currencyRepository = AppDataSource.getRepository(Currency);
      const fromCurrency = CurrencyDTO.fromModel(await currencyRepository.findOneBy({ acronym: "BRL" }));
      const toCurrency = CurrencyDTO.fromModel(await currencyRepository.findOneBy({ id: Number(transactionDTO.currency) }))    

      let amountBRL: number = await convertCurrencys(fromCurrency, toCurrency,transactionDTO.amount)
      transactionDTO.amountBRL = amountBRL          

      if(!(transactionDTO.isCredit)){
        const statement: TransactionDTO = await this.getStatementInCurrency(transactionDTO.wallet.user.id, transactionDTO.wallet.currency.id)        

        if(transactionDTO.amount > statement.amount){
          throw new InsufficientFundsException()
        }
      }

      const newTransaction = transactionDTO.toModel()
      const savedTransaction = await transactionRepository.save(newTransaction)
      return savedTransaction

  }

  async refoundTransaction(transactionId:number){
      const transactionRepository = AppDataSource.getRepository(WalletTransaction)
      const transaction = await transactionRepository.findOne({
        where:{ 
          id: transactionId
        },
        relations: {
          wallet: {
            user: true,
            currency: true
          }
        }
      })

      if(!transaction){
        throw new TransactionNotFound();
      }

      if(transaction.isRefunded){
        throw new TransactionIsRefunded()        
      }

      const transactionDate = moment(transaction.createdAt)

      if(transactionDate.diff(moment(), "days") >= 7){
        throw new TransactionSevenDaysAgo()        
      }

      const transactionOfRefund = new TransactionDTO(
        null,
        transaction.amount,
        null,
        !transaction.isCredit,
        false,
        CurrencyDTO.fromModel(transaction.wallet.currency),
        WalletDTO.fromModel(transaction.wallet),
        new Date(),
        null,
      )

      await this.createTransaction(transactionOfRefund)

      await transactionRepository
            .createQueryBuilder()
            .update(transaction)
            .set({
              refundedAt: moment(),
              isRefunded: true
            })
            .where({
              id: transaction.id
            })
            .execute()

      return {
        transactionRefunded: transaction,
        newTransaction: transactionOfRefund
      }
  }
}

async function convertCurrencys(FromCurrency: CurrencyDTO, ToCurrency: CurrencyDTO, amount: number) {
  try {
    const currencyRepository = AppDataSource.getRepository(Currency);
    const fromCurrency = await currencyRepository.findOneBy({ id: FromCurrency.id });
    const toCurrency = await currencyRepository.findOneBy({ id: ToCurrency.id });    

    const req = axios.create({
        baseURL: 'https://economia.awesomeapi.com.br/json/',
    })    
    
    if(fromCurrency.id === toCurrency.id){
      
      return Number(amount)
    }
    
    if(fromCurrency.id != toCurrency.id){
      const response = await req.get(`/${fromCurrency.acronym}-${toCurrency.acronym}`)

      console.log(response);
      

      let amountResponse: currencyQuote = {
        from: response.data[0].code,
        to: response.data[0].codein,
        bid: response.data[0].bid,
      }    
      return (amount * amountResponse.bid);
    }

  } 
  catch(error) {
    throw new ConvertCurrencyException(FromCurrency,ToCurrency);
  }
}