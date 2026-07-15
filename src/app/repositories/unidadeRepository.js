import { consulta } from '../../database/conexao.js'

class UnidadeRepository {

    findAll() {
        const sql = 'SELECT id, nome, cidade, uf FROM unidade WHERE ativo = 1 ORDER BY nome;'
        return consulta(sql, [], 'Não foi possível localizar unidades')
    }

    findById(id) {
        const sql = 'SELECT id, nome, cidade, uf FROM unidade WHERE id=? AND ativo=1;'
        return consulta(sql, [id], 'Não foi possível localizar unidade')
    }

    // Busca por nome (ativa ou inativa) pra verificar duplicata
    findByNome(nome) {
        const sql = 'SELECT id, nome, cidade, uf, ativo FROM unidade WHERE nome=?;'
        return consulta(sql, [nome])
    }

    // Reativa unidade desativada e atualiza dados
    reactivate(id, unidade) {
        const sql = 'UPDATE unidade SET nome=?, cidade=?, uf=?, ativo=1 WHERE id=?;'
        return consulta(sql, [unidade.nome, unidade.cidade, unidade.uf, id])
    }

    create(unidade) {
        const sql = 'INSERT INTO unidade (nome, cidade, uf) VALUES (?, ?, ?);'
        return consulta(sql, [unidade.nome, unidade.cidade, unidade.uf])
    }

    update(unidade, id) {
        const sql = 'UPDATE unidade SET nome=?, cidade=?, uf=? WHERE id=?;'
        return consulta(sql, [unidade.nome, unidade.cidade, unidade.uf, id])
    }

    delete(id) {
        const sql = 'UPDATE unidade SET ativo=0 WHERE id=?;'
        return consulta(sql, [id], 'Não foi possível desativar unidade')
    }
}

export default new UnidadeRepository()