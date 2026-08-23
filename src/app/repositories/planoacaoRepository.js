import { consulta } from "../../database/conexao.js"

class PlanoAcaoRepository {

    listar() {
        const sql = `
            SELECT p.*, a.descricao AS alerta_descricao, a.unidade AS alerta_unidade,
                   a.tipo_relato AS alerta_tipo, a.data_ocorrencia AS alerta_data
            FROM  plano_acao p
            LEFT JOIN alerta a ON a.id = p.alerta_id
            ORDER BY p.criado_em DESC
        `
        return consulta(sql, [], "Não foi possível listar os planos de ação!")
    }

    buscarPorId(id) {
        const sql = "SELECT * FROM plano_acao WHERE id = ?"
        return consulta(sql, [id], "Não foi possível localizar o plano!")
    }

    buscarPorAlerta(alertaId) {
        const sql = "SELECT * FROM plano_acao WHERE alerta_id = ? ORDER BY criado_em DESC"
        return consulta(sql, [alertaId], "Não foi possível localizar planos do alerta!")
    }

    criar(dados) {
        const sql = `
            INSERT INTO plano_acao
            (alerta_id, o_que, por_que, onde, quando, quem, como, quanto, status, data_criacao, data_inicio, data_fim)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const valores = [
            dados.alerta_id,
            dados.o_que || null,
            dados.por_que || null,
            dados.onde || null,
            dados.quando || null,
            dados.quem || null,
            dados.como || null,
            dados.quanto || null,
            dados.status || 'Aberto',
            dados.data_criacao || null,
            dados.data_inicio || null,
            dados.data_fim || null
        ]
        return consulta(sql, valores, "Não foi possível criar o plano de ação!")
    }

    atualizar(id, dados) {
        const sql = `
            UPDATE plano_acao SET
                o_que = ?, por_que = ?, onde = ?, quando = ?, quem = ?,
                como = ?, quanto = ?, status = ?, data_inicio = ?, data_fim = ?
            WHERE id = ?
        `
        const valores = [
            dados.o_que || null,
            dados.por_que || null,
            dados.onde || null,
            dados.quando || null,
            dados.quem || null,
            dados.como || null,
            dados.quanto || null,
            dados.status || 'Aberto',
            dados.data_inicio || null,
            dados.data_fim || null,
            id
        ]
        return consulta(sql, valores, "Não foi possível atualizar o plano de ação!")
    }

    deletar(id) {
        const sql = "DELETE FROM plano_acao WHERE id = ?"
        return consulta(sql, [id], "Não foi possível excluir o plano de ação!")
    }
}

export default new PlanoAcaoRepository()
