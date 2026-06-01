import { consulta } from '../../database/conexao.js'

class BlitizRepository {
    create(blitiz) {
        const sql = 'INSERT INTO blitiz (nome, unidade, tipo_colaborador, turno, setor, checklist, outros_pontos, reforco_positivo, feedback_positivo, orientacoes, melhorias, observacao_oportunidades, tipo_relato, observacoes, data_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
        return consulta(sql, [blitiz.nome, blitiz.unidade, blitiz.tipo_colaborador, blitiz.turno, blitiz.setor, blitiz.checklist, blitiz.outros_pontos, blitiz.reforco_positivo, blitiz.feedback_positivo, blitiz.orientacoes, blitiz.melhorias, blitiz.observacao_oportunidades, blitiz.tipo_relato, blitiz.observacoes, blitiz.data_registro], 'Não foi possível cadastrar')
    }

    findAll() {
        const sql = 'SELECT * FROM blitiz;'
        return consulta(sql, [], 'Não foi possível localizar')
    }

    findByid(id) {
        const sql = 'SELECT * FROM blitiz WHERE id=?;'
        return consulta(sql, [id], 'Não foi possível localizar')
    }

    update(blitiz, id) {
        const sql = 'UPDATE blitiz SET nome=?, unidade=?, tipo_colaborador=?, turno=?, setor=?, checklist=?, outros_pontos=?, reforco_positivo=?, feedback_positivo=?, orientacoes=?, melhorias=?, observacao_oportunidades=?, tipo_relato=?, observacoes=?, data_registro=? WHERE id=?;'
        return consulta(sql, [blitiz.nome, blitiz.unidade, blitiz.tipo_colaborador, blitiz.turno, blitiz.setor, blitiz.checklist, blitiz.outros_pontos, blitiz.reforco_positivo, blitiz.feedback_positivo, blitiz.orientacoes, blitiz.melhorias, blitiz.observacao_oportunidades, blitiz.tipo_relato, blitiz.observacoes, blitiz.data_registro, id], 'Não foi possível atualizar')
    }

    delete(id) {
        const sql = 'DELETE FROM blitiz WHERE id=?;'
        return consulta(sql, [id], 'Não foi possível apagar')
    }
}

export default new BlitizRepository()
