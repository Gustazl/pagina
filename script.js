document.addEventListener('DOMContentLoaded', () => {
    const botao = document.getElementById('meuBotao');
    const mensagem = document.getElementById('mensagem');

    botao.addEventListener('click', () => {
        mensagem.textContent = 'Olá! Você clicou no botão.';
    });
});

