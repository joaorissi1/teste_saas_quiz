require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

// Serve os arquivos do site (Pasta public)
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURAÇÃO DO SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- LÓGICA DE PONTUAÇÃO ---
const calculateMaturity = (answers) => {
    let score = 0;
    const values = { 'Sim': 2, 'Parcialmente': 1, 'Não': 0 };

    answers.forEach(ans => {
        if (values.hasOwnProperty(ans)) {
            score += values[ans];
        }
    });

    let level = '';
   let summary = ''; 
    if (score <= 7) {
        level = 'Maturidade Inicial';
        summary = 'Sua empresa precisa organizar os processos básicos. O foco agora deve ser documentar rotinas e definir metas claras.';
    } else if (score <= 14) {
        level = 'Maturidade em Desenvolvimento';
        summary = 'Você já tem uma base sólida. O próximo passo é integrar seus sistemas e começar a usar dados para tomar decisões.';
    } else {
        level = 'Maturidade Avançada';
        summary = 'Excelente! Sua gestão é eficiente. O foco agora é inovação, cultura organizacional e automação total.';
    }

    // Retorna o score, o nível E o resumo
    return { score, level, summary };
};

// --- ROTA DA API ---
app.post('/api/submit-quiz', async (req, res) => {
    try {
        const { company, email, responses } = req.body;

        // Validação
        if (!company || !email || !responses) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        // 1. Calcula
        const result = calculateMaturity(responses);

        // 2. Salva no Supabase
        const { data, error } = await supabase
            .from('maturity_assessments')
            .insert([
                { 
                    company_name: company, 
                    contact_email: email, 
                    answers: responses, 
                    score: result.score, 
                    maturity_level: result.level 
                }
            ]);

        if (error) {
            console.error("Erro Supabase:", error);
            throw error;
        }

        // 3. Responde ao Front
        res.status(200).json({ 
            success: true, 
            score: result.score, 
            level: result.level, 
            summary : result.summary
        });

    } catch (err) {
        console.error("Erro Interno:", err);
        res.status(500).json({ error: 'Erro ao processar a solicitação.' });
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});