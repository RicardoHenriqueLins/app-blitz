// =============================
// MOSTRAR SETOR
// =============================

document
.querySelectorAll('input[name="setor"]')
.forEach(radio => {

radio.addEventListener("change", mostrarSetor)

})

function mostrarSetor(){

const setor =
document.querySelector('input[name="setor"]:checked').value

document.getElementById("distribuicao").classList.add("hidden")
document.getElementById("armazem").classList.add("hidden")

document.getElementById(setor).classList.remove("hidden")

}


// =============================
// ENVIO FORM
// =============================

document
.getElementById("formBlitz")
.addEventListener("submit", async function(event){

event.preventDefault()

const botao = document.getElementById("ButtonBlitiz")

botao.disabled = true
botao.innerText = "Enviando..."


// dados básicos

const nome =
document.querySelector('[name="nome"]').value

const unidade =
document.querySelector('[name="unidade"]').value

const tipo_colaborador =
document.querySelector('[name="tipoColaborador"]').value

const turno =
document.querySelector('[name="turno"]').value

const setor =
document.querySelector('input[name="setor"]:checked').value


// checklist

const checklist = []

document
.querySelectorAll(`#${setor} input[type="checkbox"]:checked`)
.forEach(item => checklist.push(item.value))


// oportunidades

let outros_pontos = ""

if(setor === "distribuicao"){

outros_pontos =
document.querySelector('[name="oportunidadesDistribuicao"]').value

}

if(setor === "armazem"){

outros_pontos =
document.querySelector('[name="oportunidadesArmazem"]').value

}


// perguntas gerais

const reforco_positivo =
document.querySelector('input[name="reforco_positivo"]:checked')?.value??""

const feedback_positivo =
document.querySelector('input[name="feedback_positivo"]:checked')?.value??""

const orientacoes =
document.querySelector('[name="orientacoes"]').value

const melhorias =
document.querySelector('[name="melhorias"]').value

const observacao_oportunidades =
document.querySelector('[name="observacao_oportunidades"]').value

const tipo_relato =
document.querySelector('[name="tipoRelato"]').value

const observacoes =
document.querySelector('[name="observacoes"]').value


// objeto

const blitiz = {

nome,
unidade,
tipo_colaborador,
turno,
setor,
checklist: JSON.stringify(checklist),
outros_pontos,
reforco_positivo,
feedback_positivo,
orientacoes,
melhorias,
observacao_oportunidades,
tipo_relato,
observacoes,
data_registro: new Date().toISOString().slice(0, 19).replace('T', ' ') // "2026-03-12 10:30:00"
}


// envio

const response = await fetch("/blitiz",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(blitiz)

})

if(!response.ok){

throw new Error("Erro servidor")

}


alert("Blitz enviada com sucesso")



document.getElementById("formBlitz").reset()

botao.disabled = false
botao.innerText = "Enviar Blitz"

})