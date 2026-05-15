// Variáveis que comunicam com a tela
const setupContainer = document.getElementById('setup-container')
const gameContainer = document.getElementById('game-container')
const wordDisplay = document.getElementById('word-display')
const gameMessage = document.getElementById('game-message')
const errorCount = document.getElementById('error-count')
const resetBtn = document.getElementById('reset-btn')
const somAcerto = new Audio('acertou.mp3')
const hintDisplay = document.getElementById('hint-display')
const somErro = new Audio('errou.mp3')
const dificuldadeInput = document.getElementById('dificuldade-input')

const URL_API = 'https://api-palavras-8ptt.onrender.com/'

async function iniciarJogo(event) {
    if (event.key == "Enter") {
        const nickname = document.getElementById('nickname-input').value

        if (!nickname) {
            alert('Oh parça, preencha o nickname')
            return
        }

        const response = await fetch(`${URL_API}/iniciar`,
            {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {nickname: nickname, nivel: dificuldadeInput.value} )
            }
        );

        const data = await response.json()

        if (data.erro) {
            alert(data.erro)
            return
        }

        setupContainer.classList.add('hidden')
        gameContainer.classList.remove('hidden')
        document.getElementById('player-display').innerText = data.mensagem
        document.getElementById('dificuldade-display').innerText = `Dificuldade: ${dificuldadeInput.value}`.toUpperCase()

        buscarPalavra()
    }
}

async function buscarPalavra() {
    const response = await fetch(`${URL_API}/status`, 
        {
            credentials: 'include',
            method: 'GET'
        }
    )

    const data = await response.json()

    wordDisplay.innerHTML = ''

    // Mostra a dica
    hintDisplay.innerText = `Dica: ${data.dica}`

    // Cria os espaços dos caracteres da palavra sorteada
    for (let i = 0; i < data.qtde_caracteres; i++) {
        const span = document.createElement('span')
        span.className = 'letter-slot'
        span.id = `slot-${i}`
        wordDisplay.appendChild(span)
    }
}

async function tentarLetra(event) {
    if (event.key == "Enter") {
        const input = document.getElementById('letter-input')
        const caractere = input.value
        input.value = ''
        input.focus()

        if (!caractere) {
            alert('Digite um caractere para jogar!')
            return
        }

        const response = await fetch(`${URL_API}/tentativa`, 
            {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {caractere: caractere} )

            }
        )

        const data = await response.json()

        // Atualiza as letras caso tenha acertado
        if (data.posicoes.length > 0) {
            data.posicoes.forEach(pos => {
                document.getElementById(`slot-${pos}`).innerText = caractere
                document.getElementById(`slot-${pos}`).classList.add('filled')
            });
            somAcerto.play()
        } else {
            // Errou: toca o som e chacoalha o input
            somErro.play()
            input.classList.add('shake')
            input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true })
        }

        errorCount.innerText = data.erros_atuais
        gameMessage.innerText = data.mensagem

        // Se terminar o jogo
        if (data.status_jogo != 'jogando') {
            resetBtn.classList.remove('hidden')

            if (data.status_jogo == 'Derrota') {
                gameMessage.style.color = 'var(--danger)'

                // Revela a palavra correta nos slots vazios
                if (data.palavra) {
                    data.palavra.split('').forEach((letra, i) => {
                        const slot = document.getElementById(`slot-${i}`)
                        if (!slot.innerText) {
                            slot.innerText = letra
                            slot.style.color = 'var(--danger)'
                            slot.style.borderColor = 'var(--danger)'
                        }
                    })
                }
            } else {
                gameMessage.style.color = 'var(--accent)'
            }
        }
    }
}

function reiniciarJogo() {
    location.reload()
}