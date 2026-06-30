import { consulta } from '../../database/conexao.js'

class alertaRepository {
    create(alerta) {
        const sql = 'INSERT INTO alerta (nome, re, area_emitente, turno, Data_ocorrencia, horario, tipo_colaborador, empresa, area_ocorrencia, local, descricao, acoes, tipo_relato, data_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
        return consulta(sql, [alerta.nome, alerta.re, alerta.area_emitente, alerta.turno, alerta.Data_ocorrencia, alerta.horario, alerta.tipo_colaborador, alerta.empresa, alerta.area_ocorrencia, alerta.local, alerta.descricao, alerta.acoes, alerta.tipo_relato, alerta.data_registro], 'Não foi possível cadastrar')
    }

    findAll() {
        const sql = 'SELECT * FROM alerta ORDER BY id DESC;'
        return consulta(sql, [], 'Não foi possível localizar')
    }

    findByid(id) {
        const sql = 'SELECT * FROM alerta WHERE id=?;'
        return consulta(sql, [id], 'Não foi possível localizar')
    }

    update(alerta, id) {
        const sql = 'UPDATE alerta SET nome=?, re=?, area_emitente=?, turno=?, Data_ocorrencia=?, horario=?, tipo_colaborador=?, empresa=?, area_ocorrencia=?, local=?, descricao=?, acoes=?, tipo_relato=?, data_registro=? WHERE id=?;'
        return consulta(sql, [alerta.nome, alerta.re, alerta.area_emitente, alerta.turno, alerta.Data_ocorrencia, alerta.horario, alerta.tipo_colaborador, alerta.empresa, alerta.area_ocorrencia, alerta.local, alerta.descricao, alerta.acoes, alerta.tipo_relato, alerta.data_registro, id], 'Não foi possível atualizar')
    }

    delete(id) {
        const sql = 'DELETE FROM alerta WHERE id=?;'
        return consulta(sql, [id], 'Não foi possível apagar')
    }
}

export default new alertaRepository()
