document.addEventListener('DOMContentLoaded', function() {
    // --- Header Scroll e Hamburger Menu ---
    const header = document.querySelector('header');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li a'); // Todos os links de navegação

    // Adiciona classe 'scrolled' ao header ao rolar a página
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) { // Ajuste 50px conforme necessário
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Toggle para o menu hambúrguer
    hamburgerBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburgerBtn.classList.toggle('active'); // Opcional: para animar o ícone do hambúrguer
        document.body.classList.toggle('modal-open'); // Desabilita scroll do body
    });

    // Fecha o menu ao clicar em um link (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                document.body.classList.remove('modal-open'); // Reabilita scroll do body
            }
        });
    });


    // --- Galeria de Desenhos (Filtro e Lightbox) ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    // ATENÇÃO: Selecionado pelo ID específico para o botão de fechar do lightbox
    const closeLightboxBtn = document.getElementById('closeLightboxBtn');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe 'active' de todos os botões e adiciona ao clicado
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter; // 'all', 'lapis', 'personagem', etc.

            galleryItems.forEach(item => {
                // Adiciona 'hidden' para iniciar a transição de saída
                item.classList.add('hidden');
                item.style.display = 'none'; // Esconde imediatamente para que a rolagem funcione corretamente

                // Remove 'hidden' e exibe após um curto delay para a transição de entrada
                setTimeout(() => {
                    if (filter === 'all' || item.classList.contains(filter)) {
                        item.style.display = 'block'; // Ou 'flex', dependendo do seu layout original
                        setTimeout(() => { // Pequeno delay para a animação de entrada
                            item.classList.remove('hidden');
                        }, 50); // Ajuste o delay conforme necessário
                    }
                }, 300); // Deve ser igual ou maior que a duração da transição CSS (.gallery-item)
            });
        });
    });

    // Abrir Lightbox ao clicar em uma imagem da galeria
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const caption = item.querySelector('p'); // A legenda é o parágrafo dentro do item

        img.addEventListener('click', function() {
            lightbox.style.display = 'block';
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightboxCaption.textContent = caption ? caption.textContent : this.alt; // Usa o texto do <p> ou o alt da imagem
            document.body.classList.add('modal-open'); // Impede a rolagem do fundo
        });
    });

    // Fechar Lightbox
    closeLightboxBtn.addEventListener('click', function() {
        lightbox.style.display = 'none';
        document.body.classList.remove('modal-open'); // Reabilita a rolagem do fundo
    });

    // Fechar Lightbox ao clicar fora da imagem
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) { // Se o clique foi no overlay, não na imagem
            lightbox.style.display = 'none';
            document.body.classList.remove('modal-open'); // Reabilita a rolagem do fundo
        }
    });

    // --- Buscador de Unidades (CEP) ---
    const cepInput = document.getElementById('cepInput');
    const searchCepBtn = document.getElementById('searchCepBtn');
    const cepError = document.getElementById('cepError');
    const unitResults = document.getElementById('unitResults');

    // Máscara para o CEP (adiciona o hífen automaticamente)
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
    });

    searchCepBtn.addEventListener('click', function() {
        const cep = cepInput.value.replace(/\D/g, ''); // Remove não-dígitos
        cepError.textContent = ''; // Limpa mensagens de erro anteriores
        unitResults.innerHTML = ''; // Limpa resultados anteriores

        if (cep.length !== 8) {
            cepError.textContent = 'Por favor, digite um CEP válido (8 dígitos).';
            return;
        }

        // Simulação de busca de unidades por CEP (substitua por sua lógica real)
        // Você precisaria de um backend ou uma API para buscar unidades reais
        const units = [
            {
                name: 'Unidade Centro',
                address: 'Rua do Centro, 123 - Centro, Florianópolis - SC',
                cepRange: { min: '88000000', max: '88015999' }
            },
            {
                name: 'Unidade Norte da Ilha',
                address: 'Rodovia SC-401, 456 - Canasvieiras, Florianópolis - SC',
                cepRange: { min: '88030000', max: '88060999' }
            },
            {
                name: 'Unidade Campeche',
                address: 'Avenida Campeche, 789 - Campeche, Florianópolis - SC',
                cepRange: { min: '88063000', max: '88066999' }
            }
        ];

        let foundUnit = null;
        for (const unit of units) {
            if (cep >= unit.cepRange.min && cep <= unit.cepRange.max) {
                foundUnit = unit;
                break;
            }
        }

        if (foundUnit) {
            unitResults.innerHTML = `
                <h3>Unidade Encontrada:</h3>
                <div class="unit-item">
                    <p><strong>${foundUnit.name}</strong></p>
                    <p>${foundUnit.address}</p>
                </div>
                <p>Entre em contato com esta unidade para mais informações!</p>
            `;
        } else {
            unitResults.innerHTML = `<p>Nenhuma unidade encontrada para o CEP ${cep}. Por favor, tente um CEP diferente ou entre em contato.</p>`;
        }
    });

   // --- Pop-up (Modal) de Inscrição ---
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalForm = document.getElementById('modalForm');
// Opcional: Se quiser manter o botão manual, mantenha esta linha
const openModalBtn = document.getElementById('openModalBtn'); 

// Função para ABRIR o modal
function openModal() {
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open'); // Impede a rolagem do fundo
    }
}

// Função para FECHAR o modal
function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open'); // Reabilita a rolagem
    }
}

// *** GATILHO AUTOMÁTICO ***
// Espera 3 segundos (3000 ms) após o carregamento da página para abrir o modal
setTimeout(openModal, 3000);

// --- Eventos de Fechamento ---

// Fecha o modal pelo botão 'X'
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// Opcional: Abre o modal ao clicar no botão manual
if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
}

// Fecha o modal ao clicar fora do conteúdo (no overlay)
if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Fecha com a tecla 'Escape' (melhora a usabilidade)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Envio do formulário do modal (usando EmailJS)
if (modalForm) {
    modalForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Substitua 'service_XXXXX' e 'template_XXXXX' pelos seus IDs reais
        emailjs.sendForm('service_XXXXX', 'template_XXXXX', this) 
            .then(function(response) {
                alert('Sua inscrição foi enviada com sucesso!');
                modalForm.reset();
                closeModal(); // Fecha o modal após o envio
            }, function(error) {
                alert('Ocorreu um erro ao enviar sua inscrição. Tente novamente.');
                console.error('Falha ao enviar inscrição:', error);
            });
    });
}

    // Envio do formulário do modal (usando EmailJS)
    modalForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        emailjs.sendForm('service_XXXXX', 'template_XXXXX', this) // Substitua pelos seus IDs
            .then(function(response) {
                alert('Sua inscrição foi enviada com sucesso! Entraremos em contato em breve.');
                modalForm.reset(); // Limpa o formulário
                modalOverlay.classList.remove('active'); // Fecha o modal
                document.body.classList.remove('modal-open'); // Reabilita a rolagem
            }, function(error) {
                alert('Ocorreu um erro ao enviar sua inscrição. Por favor, tente novamente.');
                console.error('Falha ao enviar inscrição:', error);
            });
    });

    // Máscara para o telefone no modal
    const popupTelefoneInput = document.getElementById('popup-telefone');
    if (popupTelefoneInput) {
        popupTelefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            if (value.length > 0) {
                value = `(${value.substring(0, 2)}`;
            }
            if (value.length > 3) {
                value += `) ${value.substring(2, 7)}`;
            }
            if (value.length > 10) {
                value += `-${value.substring(7, 11)}`;
            }
            e.target.value = value;
        });
    }

}); 