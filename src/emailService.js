import nodemailer from 'nodemailer'
import gestorRepository from './app/repositories/gestorRepository.js'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { ciphers: 'SSLv3', rejectUnauthorized: false },
    dnsOptions: { family: 4 }
})

const formatarData = (d) => { if (!d) return '—'; try { return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') } catch { return d } }

const enviarEmailAlerta = async (alerta) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) { console.log('SMTP não configurado'); return }
        const gestores = await gestorRepository.findByAreaUnidade(alerta.area_emitente || '', alerta.unidade || '')
        if (!gestores || !gestores.length) { console.log('Nenhum gestor para:', alerta.unidade); return }
        const to = gestores.map(g => g.email).join(', ')
        const html = '<div style="font-family:Arial;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden"><div style="background:#1b5e20;color:#fff;padding:16px 24px"><h2 style="margin:0;font-size:18px">Novo Alerta de Segurança</h2></div><div style="padding:20px 24px;font-size:14px;color:#333"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;font-weight:600;color:#666;width:140px">Tipo</td><td>' + (alerta.tipo_relato || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Emitente</td><td>' + (alerta.nome || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Unidade</td><td>' + (alerta.unidade || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Área</td><td>' + (alerta.area_emitente || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Turno</td><td>' + (alerta.turno || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Data</td><td>' + formatarData(alerta.Data_ocorrencia) + '</td></tr></table><div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:6px"><p style="font-weight:600;color:#666;margin:0 0 4px">Descrição:</p><p style="margin:0">' + (alerta.descricao || 'Sem descrição') + '</p></div></div></div>'
        await transporter.sendMail({ from: process.env.SMTP_USER, to, subject: 'Alerta Segurança — ' + (alerta.tipo_relato || '') + ' — ' + (alerta.unidade || ''), html })
        console.log('Email alerta enviado para:', to)
    } catch (err) { console.error('Erro email alerta:', err.message) }
}

const enviarEmailOcorrencia = async (oc) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) { console.log('SMTP não configurado'); return }
        const gestores = await gestorRepository.findByUnidade(oc.unidade || '')
        if (!gestores || !gestores.length) { console.log('Nenhum gestor para:', oc.unidade); return }
        const to = gestores.map(g => g.email).join(', ')
        const tipos = { fatal: 'FATAL', caf: 'CAF', saf: 'SAF', incidente: 'Incidente' }
        const cores = { fatal: '#b71c1c', caf: '#e65100', saf: '#f9a825', incidente: '#66bb6a' }
        const html = '<div style="font-family:Arial;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden"><div style="background:' + (cores[oc.tipo] || '#1b5e20') + ';color:#fff;padding:16px 24px"><h2 style="margin:0;font-size:18px">Comunicado de Ocorrência — ' + (tipos[oc.tipo] || oc.tipo) + '</h2></div><div style="padding:20px 24px;font-size:14px;color:#333"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;font-weight:600;color:#666;width:160px">Colaborador</td><td>' + (oc.nome_colaborador || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Função</td><td>' + (oc.funcao || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Unidade</td><td>' + (oc.unidade || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Data</td><td>' + formatarData(oc.data_ocorrencia) + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Hora</td><td>' + (oc.hora_ocorrencia || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Socorros</td><td>' + (oc.primeiros_socorros || '—') + '</td></tr><tr><td style="padding:8px 0;font-weight:600;color:#666">Atestado</td><td>' + (oc.atestado_dias > 0 ? oc.atestado_dias + ' dia(s)' : 'Não') + '</td></tr></table><div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:6px"><p style="font-weight:600;color:#666;margin:0 0 4px">Descrição:</p><p style="margin:0">' + (oc.descricao || 'Sem descrição') + '</p></div></div></div>'
        await transporter.sendMail({ from: process.env.SMTP_USER, to, subject: 'Ocorrência ' + (tipos[oc.tipo] || oc.tipo) + ' — ' + (oc.unidade || '') + ' — ' + (oc.nome_colaborador || ''), html })
        console.log('Email ocorrência enviado para:', to)
    } catch (err) { console.error('Erro email ocorrência:', err.message) }
}

export { enviarEmailAlerta, enviarEmailOcorrencia }