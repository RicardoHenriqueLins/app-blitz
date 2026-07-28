import { Resend } from 'resend'
import gestorRepository from './app/repositories/gestorRepository.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'

const formatarData = (d) => {
    if (!d) return '—'
    try { return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') }
    catch { return d }
}

const enviarEmailAlerta = async (alerta) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('RESEND_API_KEY não configurada — email não enviado')
            return
        }

        console.log('Buscando gestores para alerta:', alerta.area_emitente, alerta.unidade)

        const gestores = await gestorRepository.findByAreaUnidade(alerta.area_emitente || '', alerta.unidade || '')

        if (!gestores || !gestores.length) {
            console.log('Nenhum gestor encontrado')
            return
        }

        const to = gestores.map(g => g.email)
        console.log('Enviando email alerta via Resend para:', to.join(', '))

        const html = '<div style="font-family:Arial;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">' +
            '<div style="background:#1b5e20;color:#fff;padding:16px 24px"><h2 style="margin:0;font-size:18px">Novo Alerta de Segurança</h2>' +
            '<p style="margin:4px 0 0;font-size:13px;opacity:.8">M. Dias Branco — Segurança do Trabalho</p></div>' +
            '<div style="padding:20px 24px;font-size:14px;color:#333">' +
            '<table style="width:100%;border-collapse:collapse">' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666;width:140px">Tipo</td><td>' + (alerta.tipo_relato || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Emitente</td><td>' + (alerta.nome || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Unidade</td><td>' + (alerta.unidade || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Área</td><td>' + (alerta.area_emitente || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Turno</td><td>' + (alerta.turno || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Data</td><td>' + formatarData(alerta.Data_ocorrencia) + '</td></tr>' +
            '</table>' +
            '<div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:6px">' +
            '<p style="font-weight:600;color:#666;margin:0 0 4px">Descrição:</p>' +
            '<p style="margin:0">' + (alerta.descricao || 'Sem descrição') + '</p></div>' +
            (alerta.acoes ? '<div style="margin-top:12px;padding:12px;background:#e8f5e9;border-radius:6px"><p style="font-weight:600;color:#1b5e20;margin:0 0 4px">Ações tomadas:</p><p style="margin:0">' + alerta.acoes + '</p></div>' : '') +
            '</div><div style="background:#f9f9f9;padding:12px 24px;font-size:11px;color:#999;border-top:1px solid #eee">Email automático — Sistema de Segurança do Trabalho</div></div>'

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: to,
            subject: 'Alerta Segurança — ' + (alerta.tipo_relato || '') + ' — ' + (alerta.unidade || ''),
            html: html
        })

        console.log('✅ Email alerta enviado:', result)
    } catch (err) {
        console.error('❌ Erro email alerta:', err.message || err)
    }
}

const enviarEmailOcorrencia = async (oc) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('RESEND_API_KEY não configurada — email não enviado')
            return
        }

        console.log('Buscando gestores para ocorrência:', oc.unidade)

        const gestores = await gestorRepository.findByUnidade(oc.unidade || '')

        if (!gestores || !gestores.length) {
            console.log('Nenhum gestor encontrado para unidade:', oc.unidade)
            return
        }

        const to = gestores.map(g => g.email)
        console.log('Enviando email ocorrência via Resend para:', to.join(', '))

        const tipos = { fatal: 'FATAL', caf: 'CAF', saf: 'SAF', incidente: 'Incidente' }
        const cores = { fatal: '#b71c1c', caf: '#e65100', saf: '#f9a825', incidente: '#66bb6a' }

        const html = '<div style="font-family:Arial;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">' +
            '<div style="background:' + (cores[oc.tipo] || '#1b5e20') + ';color:#fff;padding:16px 24px">' +
            '<h2 style="margin:0;font-size:18px">Comunicado de Ocorrência — ' + (tipos[oc.tipo] || oc.tipo) + '</h2>' +
            '<p style="margin:4px 0 0;font-size:13px;opacity:.8">M. Dias Branco — Segurança do Trabalho</p></div>' +
            '<div style="padding:20px 24px;font-size:14px;color:#333">' +
            '<table style="width:100%;border-collapse:collapse">' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666;width:160px">Colaborador</td><td>' + (oc.nome_colaborador || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Função</td><td>' + (oc.funcao || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Tipo</td><td>' + (oc.tipo_colaborador === 'terceiro' ? 'Terceiro — ' + (oc.empresa_terceiro || '') : 'Próprio') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Unidade</td><td>' + (oc.unidade || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Local</td><td>' + (oc.local_especifico || oc.empresa_local || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Data</td><td>' + formatarData(oc.data_ocorrencia) + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Hora</td><td>' + (oc.hora_ocorrencia || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Socorros</td><td>' + (oc.primeiros_socorros || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">Atestado</td><td>' + (oc.atestado_dias > 0 ? oc.atestado_dias + ' dia(s)' : 'Não') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">CID</td><td>' + (oc.cid || '—') + '</td></tr>' +
            '<tr><td style="padding:8px 0;font-weight:600;color:#666">CAT</td><td>' + (oc.cat_aberta || '—') + '</td></tr>' +
            '</table>' +
            '<div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:6px">' +
            '<p style="font-weight:600;color:#666;margin:0 0 4px">Descrição:</p>' +
            '<p style="margin:0">' + (oc.descricao || 'Sem descrição') + '</p></div>' +
            (oc.acoes_imediatas ? '<div style="margin-top:12px;padding:12px;background:#e8f5e9;border-radius:6px"><p style="font-weight:600;color:#1b5e20;margin:0 0 4px">Ações imediatas:</p><p style="margin:0">' + oc.acoes_imediatas + '</p></div>' : '') +
            '</div><div style="background:#f9f9f9;padding:12px 24px;font-size:11px;color:#999;border-top:1px solid #eee">Email automático — Sistema de Segurança do Trabalho</div></div>'

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: to,
            subject: 'Ocorrência ' + (tipos[oc.tipo] || oc.tipo) + ' — ' + (oc.unidade || '') + ' — ' + (oc.nome_colaborador || ''),
            html: html
        })

        console.log('✅ Email ocorrência enviado:', result)
    } catch (err) {
        console.error('❌ Erro email ocorrência:', err.message || err)
    }
}

export { enviarEmailAlerta, enviarEmailOcorrencia }     