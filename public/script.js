document.getElementById('quizForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btnSubmit');
    const originalText = btn.innerText;
    
    btn.innerText = "Enviando respostas...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

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
        // Caminho relativo para funcionar no Render e Local
        const response = await fetch('/api/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('quizForm').style.display = 'none';
            const resultDiv = document.getElementById('result');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            resultDiv.style.display = 'block';
            resultDiv.style.opacity = 0;

            // --- PREENCHIMENTO DOS DADOS ---
            document.getElementById('scoreValue').innerText = data.score + "/20";
            document.getElementById('levelText').innerText = data.level;
            
            // AQUI ESTÁ A MÁGICA QUE FALTAVA:
            if (document.getElementById('summaryText')) {
                document.getElementById('summaryText').innerText = data.summary; 
            }
            // -------------------------------
            
            let opacity = 0;
            const fadeIn = setInterval(() => {
                if (opacity >= 1) clearInterval(fadeIn);
                resultDiv.style.opacity = opacity;
                opacity += 0.1;
            }, 30);

        } else {
            alert('Erro: ' + data.error);
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
});