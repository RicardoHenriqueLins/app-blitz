import nodemailer from 'nodemailer'
import gestorRepository from './app/repositories/gestorRepository.js'

let transporter = null

async function getTransporter() {

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null
    }

    if (transporter) {
        try {
            await transporter.verify()
            return transporter
        } catch {
            transporter = null
        }
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = Number(process.env.SMTP_PORT || 587)

    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    })

    await transporter.verify()

    console.log('✅ SMTP conectado com sucesso')

    return transporter
}

const formatarData = (d) => {
    if (!d) return '—'
    try {
        return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
    } catch {
        return d
    }
}

async function enviarEmailAlerta(alerta) {

    try {

        const smtp = await getTransporter()

        if (!smtp) {
            console.log('SMTP não configurado')
            return
        }

        console.log('Buscando gestores para alerta:', alerta.area_emitente, alerta.unidade)

        const gestores = await gestorRepository.findByAreaUnidade(
            alerta.area_emitente || '',
            alerta.unidade || ''
        )

        if (!gestores.length) {
            console.log('Nenhum gestor encontrado')
            return
        }

        const to = gestores.map(g => g.email).join(', ')

        console.log('Enviando email para:', to)

        const html = `
        <div style="font-family:Arial;max-width:650px;margin:auto;border:1px solid #ddd;border-radius:8px">

            <div style="background:#1b5e20;color:#fff;padding:18px">
                <h2 style="margin:0">Novo Alerta de Segurança</h2>
            </div>

            <div style="padding:20px">

                <table style="width:100%;border-collapse:collapse">

                    <tr>
                        <td><b>Tipo</b></td>
                        <td>${alerta.tipo_relato || '—'}</td>
                    </tr>

                    <tr>
                        <td><b>Emitente</b></td>
                        <td>${alerta.nome || '—'}</td>
                    </tr>

                    <tr>
                        <td><b>Unidade</b></td>
                        <td>${alerta.unidade || '—'}</td>
                    </tr>

                    <tr>
                        <td><b>Área</b></td>
                        <td>${alerta.area_emitente || '—'}</td>
                    </tr>

                    <tr>
                        <td><b>Turno</b></td>
                        <td>${alerta.turno || '—'}</td>
                    </tr>

                    <tr>
                        <td><b>Data</b></td>
                        <td>${formatarData(alerta.Data_ocorrencia)}</td>
                    </tr>

                </table>

                <div style="margin-top:20px;background:#f5f5f5;padding:15px;border-radius:6px">
                    <strong>Descrição</strong>
                    <p>${alerta.descricao || 'Sem descrição'}</p>
                </div>

            </div>

        </div>
        `

        await smtp.sendMail({
            from: `"Sistema de Segurança" <${process.env.SMTP_USER}>`,
            to,
            subject: `Alerta Segurança - ${alerta.tipo_relato || ''} - ${alerta.unidade || ''}`,
            html
        })

        console.log('✅ Email enviado com sucesso')

    } catch (err) {

        console.error('========== SMTP ERROR ==========')
        console.error('message:', err.message)
        console.error('code:', err.code)
        console.error('command:', err.command)
        console.error('response:', err.response)
        console.error('responseCode:', err.responseCode)
        console.error(err.stack)
        console.error('================================')

    }

}

async function enviarEmailOcorrencia(oc) {

    try {

        const smtp = await getTransporter()

        if (!smtp) {
            console.log('SMTP não configurado')
            return
        }

        const gestores = await gestorRepository.findByUnidade(oc.unidade || '')

        if (!gestores.length) {
            console.log('Nenhum gestor encontrado')
            return
        }

        const to = gestores.map(g => g.email).join(', ')

        const tipos = {
            fatal: 'FATAL',
            caf: 'CAF',
            saf: 'SAF',
            incidente: 'Incidente'
        }

        const cores = {
            fatal: '#b71c1c',
            caf: '#e65100',
            saf: '#f9a825',
            incidente: '#43a047'
        }

        const html = `
        <div style="font-family:Arial;max-width:650px;margin:auto;border:1px solid #ddd;border-radius:8px">

            <div style="background:${cores[oc.tipo] || '#1b5e20'};color:#fff;padding:18px">
                <h2 style="margin:0">
                    Comunicado de Ocorrência - ${tipos[oc.tipo] || oc.tipo}
                </h2>
            </div>

            <div style="padding:20px">

                <table style="width:100%">

                    <tr><td><b>Colaborador</b></td><td>${oc.nome_colaborador || '—'}</td></tr>

                    <tr><td><b>Função</b></td><td>${oc.funcao || '—'}</td></tr>

                    <tr><td><b>Unidade</b></td><td>${oc.unidade || '—'}</td></tr>

                    <tr><td><b>Data</b></td><td>${formatarData(oc.data_ocorrencia)}</td></tr>

                    <tr><td><b>Hora</b></td><td>${oc.hora_ocorrencia || '—'}</td></tr>

                    <tr><td><b>Primeiros Socorros</b></td><td>${oc.primeiros_socorros || '—'}</td></tr>

                    <tr><td><b>Atestado</b></td><td>${oc.atestado_dias > 0 ? oc.atestado_dias + ' dia(s)' : 'Não'}</td></tr>

                </table>

                <div style="margin-top:20px;background:#f5f5f5;padding:15px;border-radius:6px">
                    <strong>Descrição</strong>
                    <p>${oc.descricao || 'Sem descrição'}</p>
                </div>

            </div>

        </div>
        `

        await smtp.sendMail({
            from: `"Sistema de Segurança" <${process.env.SMTP_USER}>`,
            to,
            subject: `Ocorrência ${tipos[oc.tipo] || oc.tipo} - ${oc.unidade || ''}`,
            html
        })

        console.log('✅ Email ocorrência enviado')

    } catch (err) {

        console.error('========== SMTP ERROR ==========')
        console.error('message:', err.message)
        console.error('code:', err.code)
        console.error('command:', err.command)
        console.error('response:', err.response)
        console.error('responseCode:', err.responseCode)
        console.error(err.stack)
        console.error('================================')

    }

}

export {
    enviarEmailAlerta,
    enviarEmailOcorrencia
}