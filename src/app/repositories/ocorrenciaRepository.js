import { consulta } from '../../database/conexao.js'

class OcorrenciaRepository {

    findAll() {
        const sql = 'SELECT * FROM ocorrencia ORDER BY data_ocorrencia DESC, id DESC;'
        return consulta(sql, [], 'Não foi possível localizar ocorrências')
    }

    findById(id) {
        const sql = 'SELECT * FROM ocorrencia WHERE id=?;'
        return consulta(sql, [id], 'Não foi possível localizar ocorrência')
    }

    findByTipo(tipo) {
        const sql = 'SELECT * FROM ocorrencia WHERE tipo=? ORDER BY data_ocorrencia DESC;'
        return consulta(sql, [tipo], 'Não foi possível localizar ocorrências')
    }

    create(oc) {
        const sql = `INSERT INTO ocorrencia
            (tipo, unidade, empresa_local, data_ocorrencia, hora_ocorrencia,
             nome_colaborador, funcao, tipo_colaborador, empresa_terceiro,
             local_especifico, descricao, primeiros_socorros, atestado_dias,
             cid, cat_aberta, acoes_imediatas, observacoes, data_registro)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
        return consulta(sql, [
            oc.tipo, oc.unidade, oc.empresa_local, oc.data_ocorrencia, oc.hora_ocorrencia,
            oc.nome_colaborador, oc.funcao, oc.tipo_colaborador, oc.empresa_terceiro,
            oc.local_especifico, oc.descricao, oc.primeiros_socorros, oc.atestado_dias,
            oc.cid, oc.cat_aberta, oc.acoes_imediatas, oc.observacoes, oc.data_registro
        ])
    }

    update(oc, id) {
        const sql = `UPDATE ocorrencia SET
            tipo=?, unidade=?, empresa_local=?, data_ocorrencia=?, hora_ocorrencia=?,
            nome_colaborador=?, funcao=?, tipo_colaborador=?, empresa_terceiro=?,
            local_especifico=?, descricao=?, primeiros_socorros=?, atestado_dias=?,
            cid=?, cat_aberta=?, acoes_imediatas=?, observacoes=?, data_registro=?
            WHERE id=?;`
        return consulta(sql, [
            oc.tipo, oc.unidade, oc.empresa_local, oc.data_ocorrencia, oc.hora_ocorrencia,
            oc.nome_colaborador, oc.funcao, oc.tipo_colaborador, oc.empresa_terceiro,
            oc.local_especifico, oc.descricao, oc.primeiros_socorros, oc.atestado_dias,
            oc.cid, oc.cat_aberta, oc.acoes_imediatas, oc.observacoes, oc.data_registro, id
        ])
    }

    delete(id) {
        const sql = 'DELETE FROM ocorrencia WHERE id=?;'
        return consulta(sql, [id], 'Não foi possível apagar ocorrência')
    }

    // Contagem por tipo (pra pirâmide)
    countByTipo() {
        const sql = `SELECT tipo, COUNT(*) as total FROM ocorrencia
                     GROUP BY tipo ORDER BY FIELD(tipo, 'fatal','caf','saf','incidente');`
        return consulta(sql, [], 'Não foi possível contar ocorrências')
    }

    // Contagem por tipo e mês (pra tabela mensal)
    countByTipoMes() {
        const sql = `SELECT tipo, MONTH(data_ocorrencia) as mes, COUNT(*) as total
                     FROM ocorrencia
                     WHERE data_ocorrencia IS NOT NULL
                     GROUP BY tipo, MONTH(data_ocorrencia)
                     ORDER BY tipo, mes;`
        return consulta(sql, [], 'Não foi possível contar por mês')
    }
}

export default new OcorrenciaRepository()