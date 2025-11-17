document.getElementById('quizForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btnSubmit');
    const originalText = btn.innerText;
    
    // Feedback de processamento
    btn.innerText = "Enviando respostas...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    // Coleta os dados
    const formData = new FormData(this);
    const responses = [];
    for (let i = 1; i <= 10; i++) {
        responses.push(formData.get('q' + i));
    }

    const payload = {
        company: document.getElementById('company').value,
        email: document.getElementById('email').value,
        responses: responses
    };

    try {
        // --- ALTERAÇÃO PARA PRODUÇÃO (HOSTINGER) ---
        // Removemos "http://localhost:8080" e deixamos apenas a barra "/"
        const response = await fetch('/api/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            // Sucesso: Oculta form e Mostra resultado
            document.getElementById('quizForm').style.display = 'none';
            const resultDiv = document.getElementById('result');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            resultDiv.style.display = 'block';
            resultDiv.style.opacity = 0;
            
            // Fade-in manual simples
            let opacity = 0;
            const fadeIn = setInterval(() => {
                if (opacity >= 1) clearInterval(fadeIn);
                resultDiv.style.opacity = opacity;
                opacity += 0.1;
            }, 30);

            // Preenche os dados
            document.getElementById('scoreValue').innerText = data.score + "/20";
            document.getElementById('levelText').innerText = data.level;
        } else {
            alert('Erro: ' + data.error);
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão. Tente novamente mais tarde.');
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
});