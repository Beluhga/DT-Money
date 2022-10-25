import { ReactNode, useCallback, useEffect, useState } from 'react'
import { createContext } from 'use-context-selector'
import { api } from '../lib/axios'

interface Transaction {
  id: number
  description: string
  type: 'income' | 'outcome'
  price: number
  category: string
  createdAt: string
}

interface CriarTransacaoInput {
  description: string
  category: number
  price: string
  type: 'income' | 'outcome'
}

interface TransactionContextType {
  transactions: Transaction[]
  buscarTransacoes: (query?: string) => Promise<void>
  criarTransacao: (data: CriarTransacaoInput) => Promise<void>
}

interface TransactionsProviderProps {
  children: ReactNode
}

export const TransactionsContext = createContext({} as TransactionContextType)

export function TransactionProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  // para converter o formato do body para json
  const buscarTransacoes = useCallback(async (query?: string) => {
    const response = await api.get('/transactions', {
      params: {
        _sort: 'createdAt',
        _order: 'desc',
        q: query,
      },
    })

    setTransactions(response.data)
  }, [])

  // oq passar por aqui vai fazer a funcao ser criada em memoria
  const criarTransacao = useCallback(async (data: CriarTransacaoInput) => {
    const { description, price, category, type } = data

    // novo conteudo
    const response = await api.post('/transactions', {
      description,
      category,
      price,
      type,
      createdAt: new Date(),
    })

    setTransactions((state) => [response.data, ...state])
  }, [])

  useEffect(() => {
    buscarTransacoes()
  }, [])

  return (
    <TransactionsContext.Provider
      value={{ criarTransacao, transactions, buscarTransacoes }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

/**
 * Por que que um componente renderiza?
 *
 * - Hooks changed (mudou estado, contexto, reducer);
 * - Props changed ( mudou propriedades);
 * - Parent rerendered (componente pai renderizou);
 *
 *  Qual o fluxo de renderização?
 *
 * 1. O React recria o HTML da interface daquele componente
 * 2. Compara a versao do HTML recriada com a versao anterior
 * 3. SE mudou alguma coisa, ele reescreve o HTML na tela
 *
 * Memo:
 *
 * 0. Hook changed, Props  changed (deep comparison)
 * 0.1: Comparar a versão anterior dos hooks e props
 * 0.2: SE mudo algo, ele vai permitir a nova renderização
 */
