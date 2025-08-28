// select api path depending on host
// api for local development

// osskar/api for remote use
const API_BASE = window.location.hostname === 'localhost' 
    ? '/api' 
    : '/osskar/api';

let carOptions = {};

$(document).ready(function() {
    console.log('OSS-KAR Frontend loaded!');
    loadCarOptions();
});

function loadCarOptions() {
    $('#loading').show();
    
    $.get(`${API_BASE}/options`, function(carOptionsData) {
        console.log('Options loaded:', carOptionsData);
        carOptions = carOptionsData;
        
        buildSelection('dropdown', 'engine', carOptionsData.engine);
        buildSelection('dropdown', 'wheels', carOptionsData.wheels);
        buildSelection('radio', 'paint', carOptionsData.paint);
        buildSelection('checkbox', 'extras', carOptionsData.extras);
        

        setupEventListeners();
        loadConfigFromURL();
        calculatePrice();
        
        $('#loading').hide();
    })
    .fail(function() {
        console.error('Loading failed');
        $('#loading').hide();
        alert('Fehler beim Laden der Optionen');
    });
}

function buildSelection(type, name, data) {
    if (type === 'dropdown') {

        $(`#${name}-select`).empty();
        $(`#${name}-select`).append(`<option value="">Wählen...</option>`);
        

        data.forEach(item => {
            $(`#${name}-select`).append(
                `<option value="${item.id}">${item.name}<br>${item.price}€</option>`
            );
        });
    } 
    else if (type === 'radio') {
        $(`#${name}-container`).empty();
        
        data.forEach(item => {
            $(`#${name}-container`).append(`
                <input type="radio" id="${name}-${item.id}" name="${name}" value="${item.id}">
                <label for="${name}-${item.id}">${item.name} - ${item.price}€</label><br>
            `);
        });
    }
    else if (type === 'checkbox') {
        $(`#${name}-container`).empty();
        
        data.forEach(item => {
            $(`#${name}-container`).append(`
                <input type="checkbox" id="${name}-${item.id}" name="${name}" value="${item.id}">
                <label for="${name}-${item.id}">${item.name}<br>${item.price}€</label><br>
            `);
        });
    }
}

function setupEventListeners() {

    $('select[name="engine"]').change(function() {
        console.log('Engine changed:', $(this).val());
        calculatePrice();
    });

    $('input[name="paint"]').change(function() {
        const paintId = $(this).val();
        console.log('Paint changed:', paintId);
        
        // LIVE COLOR CHANGE
        if (paintId && typeof changeCarColor === 'function') {
            const selectedPaint = carOptions.paint.find(p => p.id == paintId);
            if (selectedPaint) {
                const colorMap = {
                    'Black': '#2d2d2d',
                    'Matrix Green': '#1b5e20',
                    'Night City Purple': '#2e0854',
                    'Arctic White': '#ffffff',
                    'Gunmetal Grey': '#4a5568'
                };
                
                const hexColor = colorMap[selectedPaint.name];
                if (hexColor !== null) {
                    changeCarColor(hexColor);
                }
            }
        }
        
        calculatePrice();
    });

    $('select[name="wheels"]').change(function() {
        console.log('Wheels changed:', $(this).val());
        calculatePrice();
    });

    $('input[name="extras"]').change(function() {
        let selectedExtras = $('input[name="extras"]:checked');
        
        if (selectedExtras.length > 5) {
            $(this).prop('checked', false);
            alert('Maximal 5 Extras erlaubt!');
            return;
        }
        
        console.log('Extras changed:', selectedExtras.length, 'selected');
        calculatePrice();
    });

    $('#generateConfigButton').click(function() {
        let configData = generateConfig();
        $.ajax({
            url: `${API_BASE}/generate`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(configData), 
            success: function(response) {
                console.log('Generated URL:', response.configUrl);
                $('.result_config_url').html(`
                    <div style="margin-top: 15px; padding: 10px; border-radius: 15px;">
                        <strong>Dein Konfigurations-Link:</strong><br>
                        <input type="text" value="${response.fullUrl}" readonly style="width: 80%; margin: 10px ; padding: 5px; border-radius: 5px;">
                        </div>
                `);
            },
            error: function(xhr, status, error) {
                console.error('Generate failed:', error);
                alert('Fehler beim Generieren der URL');
            }
        });
    });

    $('#resetConfigButton').click(function() {
        $('#engine-select').val('');
        $('#wheels-select').val('');
        
        $('input[name="paint"]').prop('checked', false);
        $('input[name="extras"]').prop('checked', false);
        
        $('.result_config_url').html('');

        calculatePrice();
    });

    $('#buyButton').click(function() {
        //main-container wird nach oben gescrollt- unter dem config-container kommt scrollt ein neuer container hervor wo der nutzer
        // als erstes sein email eingibt -> weiter
        // nach email check -> daten eingeben / bzw bestätigen ->
        // bestellung jetzt aufgeben :D 
        
        $('#order-section').show();
        $('#step-email').show();
        $('#step-customer').hide();
        $('#step-confirm').hide();
        

        $('html, body').animate({
            scrollTop: $('#order-section').offset().top
        }, 800);
    });

}
// Event Delegation für Order Flow
$(document).on('click', '#confirm-email-button', function() {
    console.log('Email button clicked!');
    const email = $('#customer-email').val();
    
    if (!email || !email.includes('@')) {
        alert('Bitte gib eine gültige Email-Adresse ein!');
        return;
    }
    
    showStep('customer');
});

$(document).on('click', '#confirm-customer-data-button', function() {
    console.log('Customer button clicked!');
    const firstName = $('#customer-first-name').val();
    const lastName = $('#customer-last-name').val();
    
    if (!firstName || !lastName) {
        alert('Bitte fülle alle Felder aus!');
        return;
    }
    
    showStep('confirm');
    
    const currentPrice = $('#total-price').text();
    $('#final-price').text(currentPrice);
});

$(document).on('click', '#final-order-button', function() {
    console.log('Final order button clicked!');
    submitOrder();
});

// Helper Functions
function showStep(stepName) {
    console.log('Showing step:', stepName);
    $('.order-step').hide();
    $('#step-' + stepName).show();
}

function generateConfig() {

    let engineId = $('select[name="engine"]').val() || null;
    let paintId = $('input[name="paint"]:checked').val() || null;
    let wheelsId = $('select[name="wheels"]').val() || null;
    let extrasIds = [];
    $('input[name="extras"]:checked').each(function() {
        extrasIds.push(parseInt($(this).val()));
    });

    let configData = {
        engineId: engineId ? parseInt(engineId) : null,
        paintId: paintId ? parseInt(paintId) : null,
        wheelsId: wheelsId ? parseInt(wheelsId) : null,
        extrasIds: extrasIds
    };
    return configData;
}


function calculatePrice() {
    let configData = generateConfig();
    
    if (!configData.engineId && !configData.paintId && !configData.wheelsId && configData.extrasIds.length === 0) {
        $('#total-price').text('25.000 €');
        return;
    }

    $.ajax({
        url: `${API_BASE}/calculate`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(configData),
        success: function(response) {
            console.log('Price calculated:', response);
            $('#total-price').text(formatPrice(response.totalPrice));
        },
        error: function(xhr, status, error) {
            console.error('Price calculation failed:', error);
            $('#total-price').text('Fehler bei Berechnung');
        }
    });
}

function loadConfigFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    const engineId = urlParams.get('engine');
    const paintId = urlParams.get('color');
    const wheelsId = urlParams.get('wheels')

    const extras_String = urlParams.get('extras')
    const extraIds = extras_String ? extras_String.split('-').map(id => parseInt(id)): [];

    if (engineId) {
        $('#engine-select').val(engineId)
    }
    if (paintId) {
        $(`input[name="paint"][value="${paintId}"]`).prop('checked', true);
    }
    if (wheelsId) {
        $('#wheels-select').val(wheelsId);
    }
    extraIds.forEach(extraId => {
        $(`input[name="extras"][value="${extraId}"]`).prop('checked', true);
    })
}

function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function submitOrder() {
    const orderData = {
        email: $('#customer-email').val(),
        firstName: $('#customer-first-name').val(), 
        lastName: $('#customer-last-name').val(),
        configData: generateConfig()
    };
    
    console.log('Submitting order:', orderData);
    // TODO: API call
    alert('Bestellung wird verarbeitet! (Demo)');
}