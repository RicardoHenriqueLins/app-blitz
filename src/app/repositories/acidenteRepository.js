import { consulta } from '../../database/conexao.js'

class acidenteRepository {

    findAll() {
        const sql = 'SELECT * FROM acidente ORDER BY unidade;'
        return consulta(sql, [], 'Não foi possível localizar')
    }

    findByUnidade(unidade) {
        const sql = 'SELECT * FROM acidente WHERE unidade=?;'
        return consulta(sql, [unidade], 'Não foi possível localizar')
    }

    upsert(unidade, dados) {
        const sql = 'INSERT INTO acidente (unidade, data_acidente, recorde_dias) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data_acidente=VALUES(data_acidente), recorde_dias=VALUES(recorde_dias);'
        return consulta(sql, [unidade, dados.data_acidente, dados.recorde_dias || 0], 'Não foi possível atualizar')
    }
}

export default new acidenteRepository()