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
    loadConfigFromURL();
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
                `<option value="${item.id}">${item.name} - ${item.price}€</option>`
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
                <label for="${name}-${item.id}">${item.name} - ${item.price}€</label><br>
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
        console.log('Paint changed:', $(this).val());
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
                        <input type="text" value="${response.fullUrl}" readonly style="width: 70%; margin: 10px ; padding: 5px; border-radius: 5px;">
                        </div>
                `);
            },
            error: function(xhr, status, error) {
                console.error('Generate failed:', error);
                alert('Fehler beim Generieren der URL');
            }
        });
    });
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
        $(`$input[name="paint"][value="${paintId}"]`).prop('checked', true);
    }
    if (wheelsId) {
        $('#wheels-select').val(wheelsId);
    }
    extraIds.forEach(extraIds => {
        $(`input[name="extras"][value=${extraIds}]`).prop('checked', true);
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