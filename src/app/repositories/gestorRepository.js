import { consulta } from '../../database/conexao.js'

class GestorRepository {
    findAll() { return consulta('SELECT * FROM gestor WHERE ativo = 1 ORDER BY nome', []) }
    findById(id) { return consulta('SELECT * FROM gestor WHERE id = ? AND ativo = 1', [id]) }
    findByAreaUnidade(area, unidade) {
        return consulta('SELECT * FROM gestor WHERE ativo = 1 AND (area = ? OR area IS NULL OR area = "") AND (unidade = ? OR unidade IS NULL OR unidade = "") ORDER BY nome', [area, unidade])
    }
    findByUnidade(unidade) {
        return consulta('SELECT * FROM gestor WHERE ativo = 1 AND (unidade = ? OR unidade IS NULL OR unidade = "") ORDER BY nome', [unidade])
    }
    create(g) { return consulta('INSERT INTO gestor (nome, email, area, unidade) VALUES (?, ?, ?, ?)', [g.nome, g.email, g.area, g.unidade]) }
    update(g, id) { return consulta('UPDATE gestor SET nome=?, email=?, area=?, unidade=? WHERE id=?', [g.nome, g.email, g.area, g.unidade, id]) }
    delete(id) { return consulta('UPDATE gestor SET ativo = 0 WHERE id = ?', [id]) }
}

export default new GestorRepository()