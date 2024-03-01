// modulos internos
const inquirer = require('inquirer')
const chalk = require('chalk')

//modulos externos do node
const fs = require('fs')
const { parse } = require('path')

operation()

// opções pra entrar no banco
function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
          'Criar conta',
          'Consultar Saldo',
          'Depositar',
          'Sacar',
          'Sair',
        ],
      },
    ])
    // action -> opção selecionada
    .then((answer) => {
      const action = answer['action']

      // o que fazer quando a opção for marcada
      if (action === 'Criar conta') {
        createAccount()
      }else if (action === 'Depositar'){
        deposit()   
      }else if (action === 'Consultar Saldo'){
        getAccountBalance()
      }else if (action === 'Sacar'){
        withdraw()
      }else if (action === 'Sair'){
        console.log(chalk.bgBlue.black('Obrigado por usar o SENAC Bank'))
        process.exit()
      }

    })
    .catch((err) => console.log(err))
}

// create user account
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
  console.log(chalk.green('Defina as opções da sua conta a seguir'))
  
  //função para criar a conta
  buildAccount()
}

//Criando um diretorio Accounts - guardar as contas
function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para a sua conta:',
      },
    ])
    .then((answer) => {
      console.info(answer['accountName'])
      const accountName = answer['accountName']
      //incluindo diretorio Accounts(PASTA)
      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts')
      }
      //Verificando se usuario existe
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black('Esta conta já existe, escolha outro nome!'),
        )
        buildAccount(accountName)
        return
      }
      //Se todos retornarem falso,
      // Cria a conta e grava na pasta
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err)
        },
      )

      console.log(chalk.green('Parabéns, sua conta foi criada!'))
      ()
    })
    .catch ((err) => console.log(err))
  } 
  

  //Depositar o dinheiro na conta

  function deposit(){
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?',
            }
        ])
        .then((answer) => {
            const accountName = answer['accountName']
            
            // chama a função CHECKACCOUNT para 
            // verificar se a conta existe
            if(!checkAccount(accountName)) {
                return deposit()
            }

            inquirer
              .prompt([
                {
                  name:'amount',
                  message: 'Quanto você deseja depositar?'
                }
              ])
              .then((answer) =>{
                const amount = answer['amount']
                // chama a função ADDAMOUNT para depositar o dinheiro na conta
                addAmount(accountName, amount)
                operation()
              })
        })
  }

  // verifica se conta existe
  function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe, escolha outra nome!'))
        return false
    }
    return true
  }

  //função auxiliar - OBTER A QUANTIA QUE TEM NA CONTA
  function getAccount(accountName){
    // ver o conteudo na pasta ACCOUNTS
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
    encoding:'utf8',
    flag:'r',
  })
  return JSON.parse(accountJSON)
}

// pega a quantia que ta na conta e adiciona o deposito
function addAmount(accountName, amount){
  // accountData = o quanto o usuario tem atualmente
  const accountData = getAccount(accountName)

  if(!amount){
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente mais tarde'),
      )
  return deposit()
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

  // sobescrever a quantia antiga para a quantia atual
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function(err){
      console(err)
    },
  )

    console.log(chalk.greenBright(`Deposito realizado com sucesso! 
    Valor R$${amount}`))
}

//finalizamos a função depositar

// Verificar a quantia que tem na conta
function getAccountBalance(){
  inquirer
    .prompt([{
      name: 'accountName',
      message: 'Qual o nome da sua conta?'

    }])
    .then((answer)=>{
       const accountName = answer['accountName']

       if(!checkAccount(accountName)){
        return getAccountBalance
       }
       const accountData = getAccount(accountName)

       console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R${accountData.balance}`,
        ),
       )
       operation()
    })
}

// função de retirar o dinheiro
function removeAmount(accountName, amount){
  const accountData = getAccount(accountName)

  if(!amount){
    console.log(chalk.bgRed.black('Occorreu um erro, tente novamente mais tarde'))
    return withdraw()
  }

  if(accountData.balance < amount){
    console.log(chalk.bgRed.black(`Valor indisponível`))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`, JSON.stringify(accountData),

    function(err){
      console.log(err)
    }
  )
  console.log(chalk.green(`Foi realizado um saque de ${amount} da sua conta`))
}

function withdraw(){
  inquirer
    .prompt([{
      name: 'accountName',
      message: 'Qual o nome da sua conta',
    }])
    .then((answer) =>{
      const accountName = answer[`accountName`]
      if(!checkAccount(accountName)){
        return withdraw;
      }
      inquirer
      .prompt([{
        name: 'amount',
        message: 'Qual valor deseja sacar?'
      }])
    .then((answer)=>{
      const amount = answer[`amount`]

      removeAmount(accountName, amount)
      operation()
    })
    })
}
