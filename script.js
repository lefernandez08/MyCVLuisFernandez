// Importa la función createChat del chatbot de n8n
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

// Inicializa el chatbot de n8n
// Esta función debe ser llamada para que el chatbot aparezca en la página.
createChat({
    webhookUrl: 'https://fmyasociados.app.n8n.cloud/webhook/857ef0a0-49c7-48d0-ba31-43979f6a3ff2/chat',
    // Puedes personalizar la apariencia y el texto aquí:
    title: 'Asistente Migratorio',
    subtitle: '¿En qué podemos ayudarte hoy?',
    placeholder: 'Escribe tu mensaje...',
    initialMessages: [
        {
            type: 'text',
            text: '¡Hola! Soy tu asistente virtual de Fernández Méndez & Asociados. ¿Cómo podemos ayudarte con tu proceso migratorio?',
            from: 'bot'
        }
    ],
    // Personaliza los colores para que coincidan con tu marca y un look más moderno
    theme: {
        primaryColor: '#1E40AF', // Un azul más oscuro para un toque premium
        secondaryColor: '#BFDBFE', // Un azul más claro y vibrante
        accentColor: '#059669', // Verde esmeralda para acentos
        textColor: '#374151', // Texto gris oscuro para mejor contraste
        botMessageColor: '#FFFFFF',
        userMessageColor: '#BFDBFE', // Burbuja de mensaje de usuario en azul claro
        borderRadius: '12px', // Bordes más redondeados para un look moderno
        fontFamily: 'Inter, sans-serif'
    }
});

// Lógica para el Evaluador de Elegibilidad de Visa (Impulsado por Gemini API)
const eligibilityForm = document.getElementById('eligibilityForm');
const loadingIndicator = document.getElementById('loadingIndicator');
const eligibilityResults = document.getElementById('eligibilityResults');
const assessmentText = document.getElementById('assessmentText');
const suggestedPathwaysList = document.getElementById('suggestedPathwaysList');

if (eligibilityForm) {
    eligibilityForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previene el envío del formulario por defecto

        loadingIndicator.classList.remove('hidden'); // Muestra el indicador de carga
        eligibilityResults.classList.add('hidden'); // Oculta los resultados anteriores

        const nationality = document.getElementById('nationality').value;
        const education = document.getElementById('education').value;
        const experience = document.getElementById('experience').value;
        const desiredCountry = document.getElementById('desiredCountry').value;
        const goal = document.getElementById('goal').value;

        const prompt = `Basado en la siguiente información, proporciona una evaluación preliminar de posibles categorías de visa o vías de inmigración para el usuario. No garantices resultados, solo ofrece orientación general.
            Nacionalidad: ${nationality}
            Nivel Educativo Más Alto: ${education}
            Años de Experiencia Laboral: ${experience}
            País Deseado para Migrar: ${desiredCountry}
            Objetivo: ${goal}
            Proporciona la salida en formato JSON con 'assessment' (cadena de texto) y 'suggestedPathways' (array de cadenas de texto).`;

        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "assessment": { "type": "STRING" },
                        "suggestedPathways": {
                            "type": "ARRAY",
                            "items": { "type": "STRING" }
                        }
                    },
                    "required": ["assessment", "suggestedPathways"]
                }
            }
        };

        const apiKey = ""; // La clave API se proporcionará en tiempo de ejecución por Canvas
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let retryCount = 0;
        const maxRetries = 5;
        const baseDelay = 1000; // 1 second

        async function callGeminiApi() {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    if (response.status === 429 && retryCount < maxRetries) {
                        const delay = baseDelay * Math.pow(2, retryCount);
                        retryCount++;
                        console.warn(`Demasiadas solicitudes (429). Reintentando en ${delay / 1000} segundos...`);
                        await new Promise(res => setTimeout(res, delay));
                        return callGeminiApi(); // Retry the call
                    }
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const json = result.candidates[0].content.parts[0].text;
                    const parsedJson = JSON.parse(json);

                    assessmentText.textContent = parsedJson.assessment;
                    suggestedPathwaysList.innerHTML = ''; // Limpiar lista anterior
                    parsedJson.suggestedPathways.forEach(path => {
                        const li = document.createElement('li');
                        li.textContent = path;
                        suggestedPathwaysList.appendChild(li);
                    });

                    eligibilityResults.classList.remove('hidden'); // Muestra los resultados
                } else {
                    assessmentText.textContent = 'No se pudo obtener una evaluación. Por favor, intente de nuevo.';
                    suggestedPathwaysList.innerHTML = '';
                    eligibilityResults.classList.remove('hidden');
                    console.error('Estructura de respuesta inesperada de la API de Gemini:', result);
                }
            } catch (error) {
                assessmentText.textContent = 'Ocurrió un error al procesar su solicitud. Por favor, intente de nuevo más tarde.';
                suggestedPathwaysList.innerHTML = '';
                eligibilityResults.classList.remove('hidden');
                console.error('Error al llamar a la API de Gemini:', error);
            } finally {
                loadingIndicator.classList.add('hidden'); // Oculta el indicador de carga
            }
        }
        callGeminiApi();
    });
}


// Lógica para el formulario de contacto
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previene el envío del formulario por defecto

        formMessage.classList.add('hidden'); // Oculta mensajes anteriores
        formMessage.classList.remove('success', 'error'); // Limpia clases

        // Aquí es donde integrarías un servicio de backend o terceros
        // para enviar el correo electrónico a lefm08@gmail.com.
        // Dado que el HTML por sí solo no puede enviar correos,
        // esta es una simulación.

        try {
            // Simula un envío exitoso
            await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5 segundos

            formMessage.textContent = '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
            formMessage.classList.add('success');
            formMessage.classList.remove('hidden');
            contactForm.reset(); // Limpia el formulario
        } catch (error) {
            formMessage.textContent = 'Ocurrió un error al enviar el mensaje. Por favor, intente de nuevo.';
            formMessage.classList.add('error');
            formMessage.classList.remove('hidden');
            console.error('Error simulado al enviar el formulario:', error);
        }
    });
}
