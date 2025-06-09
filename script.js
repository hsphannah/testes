// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded. Script start.');

    // --- Lógica da Galeria e Filtros ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    console.log('Filter Buttons found:', filterButtons.length);
    console.log('Gallery Items found:', galleryItems.length);
    console.log(galleryItems);

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Filter button clicked!');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');
            console.log('Filter value:', filterValue);

            galleryItems.forEach(item => {
                console.log('Processing item:', item.classList);
                item.classList.add('hidden');

                setTimeout(() => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.classList.remove('hidden');
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.click();
        console.log('"Todos" button clicked on load.');
    }

    // --- Lógica do Lightbox (Modo Teatro para Imagens da Galeria) ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.close-btn');

    console.log('Lightbox DIV encontrado:', lightbox);
    console.log('Lightbox Imagem encontrada:', lightboxImg);
    console.log('Lightbox Legenda encontrada:', lightboxCaption);
    console.log('Botão de fechar encontrado:', closeBtn);

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Item da galeria clicado!', this);
            const imgSrc = this.querySelector('img').src;
            const imgAlt = this.querySelector('img').alt;

            console.log('SRC da imagem clicada:', imgSrc);
            console.log('ALT da imagem clicada:', imgAlt);

            if (lightbox) {
                lightbox.style.display = 'block';
                if (lightboxImg) lightboxImg.src = imgSrc;
                if (lightboxImg) lightboxImg.alt = imgAlt;
                if (lightboxCaption) lightboxCaption.textContent = imgAlt;
            } else {
                console.error('Erro: Elemento Lightbox não encontrado no DOM!');
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            lightbox.style.display = 'none';
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox && lightbox.style.display === 'block') {
            lightbox.style.display = 'none';
        }
    });
    
    // --- Lógica para o Header Fixo/Minimizado ao Rolar ---
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

   
    // --- LÓGICA DO MENU HAMBÚRGUER (NOVO CÓDIGO ADICIONADO) ---
 
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const nav = document.querySelector('header nav');
    const navLinks = document.querySelectorAll('header nav a'); // Pega todos os links do menu

    if (hamburgerBtn && nav) {
        // Evento para ABRIR/FECHAR o menu ao clicar no botão
        hamburgerBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });

        // Evento para FECHAR o menu ao clicar em um dos links
        // (Melhora a experiência do usuário em páginas de uma só tela)
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
            });
        });
    }

  // --- Pesquisador de CEP e Localizador de Unidade ---
    const cepInput = document.getElementById('cepInput');
    const searchCepBtn = document.getElementById('searchCepBtn');
    const cepErrorDiv = document.getElementById('cepError');
    const unitResultsDiv = document.getElementById('unitResults');

    // Funções auxiliares para exibir mensagens
    function showCepError(message) {
        cepErrorDiv.textContent = message;
        cepErrorDiv.style.display = 'block';
    }

    function hideCepError() {
        cepErrorDiv.textContent = '';
        cepErrorDiv.style.display = 'none';
    }

    function clearUnitResults() {
        unitResultsDiv.innerHTML = '';
    }

    // Adiciona máscara de CEP (formato 00000-000)
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let cep = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            if (cep.length > 5) {
                cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
            }
            e.target.value = cep;
        });
    }

    if (searchCepBtn) {
        searchCepBtn.addEventListener('click', async function() {
            hideCepError();
            clearUnitResults();
            const cep = cepInput.value.replace(/\D/g, ''); // Limpa o CEP (somente dígitos)

            if (cep.length !== 8) {
                showCepError('Por favor, digite um CEP válido com 8 dígitos.');
                return;
            }

            // Desabilita o botão e mostra feedback
            searchCepBtn.textContent = 'Buscando...';
            searchCepBtn.disabled = true;

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                // Check for API specific error (e.g., CEP not found by ViaCEP)
                if (data.erro) {
                    showCepError('CEP não encontrado ou inválido pela base de dados.');
                    return; // Stop execution if ViaCEP reports an error
                }

                console.log('Dados do CEP obtidos:', data); // Log para depuração

                // Normaliza os dados do CEP para comparação (sempre para minúsculas)
                const cepCity = data.localidade.toLowerCase();
                const cepState = data.uf.toLowerCase();
                // O bairro pode ser nulo ou vazio em alguns CEPs, então garantimos que seja string vazia
                const cepNeighborhood = data.bairro ? data.bairro.toLowerCase() : '';

                let foundUnits = [];
                let messageHeader = ''; // Para exibir a mensagem correta ao usuário

                // Reutiliza os dados de unidades que você já tem, garantindo que tenham city, state e neighborhood
                const unitsData = [
                    {
                        name: "Unidade Centro",
                        address: "Rua Hermann Blumenau, 134 -Loja 1- Centro, Florianópolis - SC",
                        phone: "0800 323 3000",
                        mapLink: "https://www.google.com/maps/search/?api=1&query=Art+Anik+School+Rua+Hermann+Blumenau,+134,+Centro,+Florianópolis,+SC",
                        city: "florianópolis",
                        state: "sc",
                        neighborhood: "centro"
                    },
                    {
                        name: "Unidade Norte da Ilha",
                        address: "Rua Intendente João Nunes Vieira,1006 - Sala 5 - Ingleses Norte, Florianópolis - SC",
                        phone: "0800 323 3000",
                        mapLink: "https://www.google.com/maps/search/?api=1&query=Art+Anik+School+Rua+Intendente+João+Nunes+Vieira,+1006,+Sala+5,+Ingleses+Norte,+Florianópolis,+SC",
                        city: "florianópolis",
                        state: "sc",
                        neighborhood: "ingleses norte"
                    },
                    {
                        name: "Unidade Campeche",
                        address: "Av. Pequeno Príncipe,1455-sala 7- Campeche,Florianópolis - SC",
                        phone: "(48) 99613-2762",
                        mapLink: "https://www.google.com/maps/search/?api=1&query=Art+Anik+School+Av.+Pequeno+Príncipe,+1455,+sala+7,+Campeche,+Florianópolis,+SC",
                        city: "florianópolis",
                        state: "sc",
                        neighborhood: "campeche"
                    },
                    // Adicione mais unidades aqui se tiver, sempre com city, state e neighborhood (em minúsculas)
                ];

                // Prioridade de busca: 1. Bairro, 2. Cidade, 3. Estado
                // Se encontrar por bairro, mostra só aquela(s). Se não, busca por cidade. Se não, por estado.
                
                // Tenta encontrar por bairro (se o bairro do CEP não for vazio)
                if (cepNeighborhood) { // Só tenta comparar por bairro se o bairro do CEP não for vazio
                    const unitsByNeighborhood = unitsData.filter(unit => 
                        unit.city === cepCity && unit.state === cepState && unit.neighborhood === cepNeighborhood
                    );
                    if (unitsByNeighborhood.length > 0) {
                        foundUnits = unitsByNeighborhood;
                        messageHeader = `<h3>Unidade(s) próxima(s) ao bairro ${data.bairro}:</h3>`;
                    }
                }

                // Se não encontrou por bairro ou o bairro do CEP era vazio, tenta por cidade e estado
                if (foundUnits.length === 0) {
                    const unitsByCity = unitsData.filter(unit => 
                        unit.city === cepCity && unit.state === cepState
                    );
                    if (unitsByCity.length > 0) {
                        foundUnits = unitsByCity;
                        messageHeader = `<h3>Unidade(s) em ${data.localidade}:</h3>`;
                    }
                }
                
                // Se ainda não encontrou por cidade, tenta por estado (menos específico)
                if (foundUnits.length === 0) {
                    const unitsByState = unitsData.filter(unit => 
                        unit.state === cepState
                    );
                    if (unitsByState.length > 0) {
                        foundUnits = unitsByState;
                        messageHeader = `<h3>Unidade(s) no estado de ${data.uf}:</h3>`;
                    }
                }


                if (foundUnits.length > 0) {
                    let resultsHTML = messageHeader; // Use o cabeçalho gerado
                    
                    foundUnits.forEach(unit => {
                        resultsHTML += `
                            <div class="unit-item">
                                <h3>${unit.name}</h3>
                                <p><strong>Endereço:</strong> ${unit.address}</p>
                                <p><strong>Telefone:</strong> ${unit.phone}</p>
                                <p><a href="${unit.mapLink}" target="_blank" class="btn-saiba-mais">Ver no Mapa</a></p>
                            </div>
                        `;
                    });
                    unitResultsDiv.innerHTML = resultsHTML;
                } else {
                    // Se nenhuma unidade foi encontrada após todas as tentativas
                    unitResultsDiv.innerHTML = `
                        <h3>Nenhuma unidade encontrada para a sua região (${data.localidade} - ${data.uf}).</h3>
                        <p>Nossas unidades atuais em Florianópolis, SC, são:</p>
                    `;
                    // Exibe todas as unidades como fallback
                    unitsData.forEach(unit => {
                         unitResultsDiv.innerHTML += `
                            <div class="unit-item">
                                <h3>${unit.name}</h3>
                                <p><strong>Endereço:</strong> ${unit.address}</p>
                                <p><strong>Telefone:</strong> ${unit.phone}</p>
                                <p><a href="${unit.mapLink}" target="_blank" class="btn-saiba-mais">Ver no Mapa</a></p>
                            </div>
                        `;
                    });
                }

            } catch (error) {
                console.error('Erro de rede ou API ao buscar CEP:', error); // Mensagem mais específica
                showCepError('Ocorreu um erro ao buscar o CEP. Por favor, verifique sua conexão ou tente novamente mais tarde.');
            } finally {
                // Reabilita o botão
                searchCepBtn.textContent = 'Buscar Unidade';
                searchCepBtn.disabled = false;
            }
        });
    }
    // --- Lógica de Envio de Formulário com EmailJS ---
    const contactForm = document.querySelector('.contact-form-column form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            console.log('Formulário de contato submetido!');

            // Captura os valores dos campos do formulário
            const userName = document.getElementById('nome').value;
            const userEmail = document.getElementById('email').value;
            const userMessage = document.getElementById('mensagem').value; // Use 'userMessage' para clareza

            // ATENÇÃO: As chaves neste objeto DEVEM CORRESPONDER EXATAMENTE aos placeholders {{...}} nos SEUS templates do EmailJS!
            const templateParamsForNotification = {
                user_name: userName,
                user_email: userEmail,
                message_content: userMessage // Nome da variável para o conteúdo da mensagem no template de NOTIFICAÇÃO
            };

            // Os parâmetros para o template de resposta automática podem ser mais simples se o template for fixo
            const templateParamsForAutoReply = {
                user_name: userName,
                user_email: userEmail
            };

            const SERVICE_ID = 'mensagem'; 
            const NOTIFICATION_TEMPLATE_ID = 'template_jk5qxpr'; // ID do template de NOTIFICAÇÃO.
            const AUTO_REPLY_TEMPLATE_ID = 'template_gnzn6uw'; // ID do template de RESPOSTA AUTOMÁTICA.


            // 1. ENVIAR E-MAIL DE NOTIFICAÇÃO PARA VOCÊ (o primeiro que pode falhar)
            emailjs.send(SERVICE_ID, NOTIFICATION_TEMPLATE_ID, templateParamsForNotification)
                .then(function(response) {
                    console.log('E-mail de NOTIFICAÇÃO enviado com sucesso!', response.status, response.text);

                    // Se a notificação foi enviada com sucesso, tenta enviar a resposta automática
                    return emailjs.send(SERVICE_ID, AUTO_REPLY_TEMPLATE_ID, templateParamsForAutoReply);
                })
                .then(function(responseAuto) {
                    // Este bloco é executado se AMBOS os envios (notificação E resposta automática) foram um sucesso
                    console.log('E-mail de RESPOSTA AUTOMÁTICA enviado com sucesso!', responseAuto.status, responseAuto.text);
                    alert('Sua mensagem foi enviada com sucesso! Você receberá uma confirmação por e-mail.');
                    contactForm.reset(); // Limpa o formulário após ambos os envios
                })
                .catch(function(error) {
                    // Este bloco é executado se QUALQUER UM DOS ENVIOS falhou
                    console.error('Ocorreu um erro no envio de e-mail:', error);

                    let errorMessage = 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.';

                    // Tente dar mais detalhes sobre o erro específico do EmailJS
                    if (error && error.text) {
                        errorMessage += '\nDetalhes do erro: ' + error.text;
                    }

                    // Verifica se o erro foi no primeiro envio ou no segundo
                    if (error.status === 400) { // Erro 400: Bad Request
                        errorMessage += '\nPor favor, verifique se os IDs de serviço/template e os nomes das variáveis nos seus templates do EmailJS estão corretos.';
                    } else if (error.status === 401) { // Erro 401: Unauthorized (problema na Public Key ou serviço)
                        errorMessage += '\nErro de autenticação. Verifique sua Public Key ou a conexão do seu serviço de e-mail no EmailJS.';
                    } else if (error.status === 429) { // Erro 429: Too Many Requests (limite excedido)
                         errorMessage += '\nLimite de envios do EmailJS excedido. Tente novamente mais tarde.';
                    }

                    alert(errorMessage);
                    contactForm.reset(); // Ainda limpa o formulário, mesmo com erro
                });
        });
    }
}); 