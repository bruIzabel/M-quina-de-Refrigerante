// 1. Função para carregar os dados do arquivo .json
async function carregarProdutos() {
    try {
        const resposta = await fetch('https://api.jsonbin.io/v3/b/69d64173aaba882197d7779a'); 
        
        if (!resposta.ok) {
            throw new Error(`Não encontrei o arquivo json (Erro ${resposta.status})`);
        }

        const dados = await resposta.json();
        console.log("DADOS DA API:", dados); // Deixei aqui caso precise olhar no console (F12)
        let bebidas = [];

        if (Array.isArray(dados.record)) {
            bebidas = dados.record; 
        } else if (typeof dados.record === 'object') {
            bebidas = Object.values(dados.record)[0]; 
        }

        const gridContainer = document.querySelector(".grid-container");

        if (gridContainer) {
            gridContainer.innerHTML = ""; 

            bebidas.forEach((bebida, index) => {
                const slotHTML = `
                    <div class="slot" onclick="selecionarProduto('${bebida.sabor}', ${bebida.preco})">
                        <img src="${bebida.imagem}" alt="${bebida.sabor}">
                        <div class="info-bebida">
                            <span class="nome-item" style="color: black;">${bebida.sabor}</span>
                            <span class="preco-item" style="color: black;">R$ ${bebida.preco.toFixed(2)}</span>
                        </div>
                    </div>
                `;
                gridContainer.innerHTML += slotHTML;
            });
        }
    } catch (erro) {
        console.error("Erro detalhado:", erro);
        const grid = document.querySelector(".grid-container");
        if (grid) grid.innerHTML = `<p style="color:red; font-size:12px; padding:10px;">Falha ao carregar produtos. <br> Verifique o console!</p>`;
    }
}
// Definimos as funções no objeto 'window' para o HTML encontrá-las
window.abrirPopup = function() {
    const modal = document.getElementById('modalOpcoes'); 
    if (modal) {
        carregarProdutos();
        modal.showModal();
    }
}

window.fecharPopup = function() {
    const modal = document.getElementById('modalOpcoes');
    if (modal) modal.close();
}

// Novas variáveis para controlar o estado da máquina
let precoRestante = 0.00;
let produtoSelecionado = "";
let aguardandoPagamento = false;

// Configura o visor inicial
const visor = document.querySelector(".visor_interno");
if (visor) visor.innerText = `Escolha o Produto`;


// Lógica de Arrastar as Moedas (Drag and Drop)

const items = document.getElementsByClassName('item');
const dropzones = document.getElementsByClassName('botao_de_inserir');

for (let item of items) {
    item.draggable = true;
    item.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('item.id', e.target.id);
    });
}

for (let zone of dropzones) {
    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('item.id');
        const item = document.getElementById(id);
        
        if (item) {
            // Verifica se o usuário já escolheu um produto antes de botar dinheiro
            if (!aguardandoPagamento) {
                visor.innerText = "Por favor, escolha um produto antes de inserir moedas!"
                return; 
            }

            // Descobre qual moeda foi inserida e define o valor
            let valorMoeda = 0;
            if (id === 'moeda_25c') valorMoeda = 0.25;
            else if (id === 'moeda_50c') valorMoeda = 0.50;
            else if (id === 'moeda_1real') valorMoeda = 1.00;

            // Subtrai o valor da moeda do preço que falta pagar
            precoRestante -= valorMoeda;

            // Move a moeda visualmente para o slot

            // Verifica se ainda falta dinheiro ou se já pagou tudo
            if (precoRestante > 0) {
                // Ainda falta pagar
                if (visor) visor.innerText = `Falta: R$ ${precoRestante.toFixed(2)}`;
            } else {
                // Pagou tudo! O que "sobrar" (ficar negativo) é o troco
                let troco = Math.abs(precoRestante); // Math.abs transforma número negativo em positivo
                
                if (visor) visor.innerText = `Troco: R$ ${troco.toFixed(2)}`;
                visor.innerText = `Refrigerante ${produtoSelecionado} liberado!\nSeu troco é R$ ${troco.toFixed(2)}`;
                
                // Zera a máquina para a próxima compra
                aguardandoPagamento = false;
                produtoSelecionado = "";
                precoRestante = 0;
                
                // Voltar o visor para o estado inicial após 3 segundos
                setTimeout(() => {
                    if (visor) visor.innerText = `Escolha o Produto`;
                }, 6000);
            }
        }
    });
}

// Função atualizada de selecionar o produto
window.selecionarProduto = function(nome, preco) {
    // Salva o que a pessoa quer comprar
    produtoSelecionado = nome;
    precoRestante = preco;
    aguardandoPagamento = true;
    
    // Atualiza o visor avisando quanto falta
    if (visor) {
        visor.innerText = `Falta: R$ ${precoRestante.toFixed(2)}`;
    }
    
    console.log(`Você escolheu ${nome}. Insira R$ ${preco.toFixed(2)}.`);
    fecharPopup();
}