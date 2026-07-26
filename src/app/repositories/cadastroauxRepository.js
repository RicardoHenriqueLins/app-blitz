import { consulta } from '../../database/conexao.js'

class CadastroAuxRepository {

    findByTipo(tipo) {
        return consulta('SELECT * FROM cadastro_aux WHERE tipo = ? AND ativo = 1 ORDER BY nome', [tipo])
    }

    create(dados) {
        return consulta(
            'INSERT INTO cadastro_aux (tipo, nome) VALUES (?, ?) ON DUPLICATE KEY UPDATE ativo = 1',
            [dados.tipo, dados.nome]
        )
    }

    update(dados, id) {
        return consulta('UPDATE cadastro_aux SET nome = ? WHERE id = ?', [dados.nome, id])
    }

    delete(id) {
        return consulta('UPDATE cadastro_aux SET ativo = 0 WHERE id = ?', [id])
    }
}

export default new CadastroAuxRepository()