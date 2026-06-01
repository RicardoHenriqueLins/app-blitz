import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'bd_blitzseguranca',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

pool.getConnection()
    .then(conn => {
        console.log('Conectado ao banco de dados MySQL!')
        conn.release()
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err)
    })

export const consulta = async (sql, valores = [], mensagemReject) => {
    try {
        const [resultado] = await pool.execute(sql, valores)
        return JSON.parse(JSON.stringify(resultado))
    } catch (erro) {
        console.error('ERRO MySQL:', erro.message)
        throw new Error(erro.message)
    }
}

export default pool
