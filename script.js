document.addEventListener('DOMContentLoaded', () => {
    // Esses IDs precisam ser EXATAMENTE iguais aos IDs do seu HTML.
    const botao1 = document.getElementById('botao1');
    const botao2 = document.getElementById('botao2');
    const mensagemElemento = document.getElementById('mensagem');

    // As funções de clique.
    botao1.addEventListener('click', () => {
        mensagemElemento.textContent = "Mateus viadão";
    });

    botao2.addEventListener('click', () => {
        mensagemElemento.textContent = "Jimmy baitola";
    });
});