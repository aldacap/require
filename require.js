// carga un script en un elemento dom
var Module = function (name) {
    var mod = {};
    // convierte una texto tipo mi-modolo a miModulo
    mod.toCamel = function (strKebab) {
        var find = /(\-\w)/g;
        var convert = function (matches) {
            return matches[1].toUpperCase();
        };
        var camelCaseString = strKebab.replace(find, convert);
        return camelCaseString;
    }
    // valida si existe el script en el dom
    mod.check = function () {
        var elm = document.getElementById(mod.id);
        if (elm && elm.dataset.loaded) {
            mod.loaded = true;
            return true;
        }
        return false;
    }
    // carga el script
    mod.load = function (onLoaded) {
        var elm = document.getElementById(mod.id);
        if (elm && elm.dataset.loaded) {
            mod.loaded = true;
            if (onLoaded)
                onLoaded(mod.nombre);
            return true;
        }
        var el = document.createElement('script');
        el.id = mod.id;
        // establece un evento para cuando termina de cargar el script
        el.onload = function (e) {
            document.getElementById(mod.id).setAttribute('data-loaded', 'true');
            mod.loaded = true;
            if (onLoaded)
                onLoaded(mod.nombre);
        };
        try {
            el.src = mod.src;
            document.head.appendChild(el);
        } catch (e) {
            alertify.error(e.message);
        }
    }
    var camelName = mod.toCamel(name);
    mod.nombre = name;
    mod.id = 'script-id-' + name;
    mod.name = 'app.' + camelName + '()';
    mod.src = "/scripts/shared/" + name + ".js?rnd=" + Math.random();
    mod.loaded = false;
    return mod;
}
// carga un array de scripts 
function require(modules, ready) {
    mod = {};
    mod.lstModules = [];
    // configura el callback
    mod.onReady = function () {
        ready()
    };
    // cuenta los scritps pendientes de cargar
    mod.countLoaded = function () {
        var loaded = mod.lstModules.length;
        if (typeof (mod.lstModules) === 'undefined' || !mod.lstModules || mod.lstModules.length == 0)
            return 0;
        for (i = 0; i < mod.lstModules.length ; i++) {
            var inDom = mod.lstModules[i].check();
            if (inDom || !mod.lstModules[i] || mod.lstModules[i].loaded)
                loaded--;
        }
        return loaded;
    }
    // analiza si ya se cargaron todos los scripts recursivamente
    mod.waitForAll = function (mod) {
        var loaded = mod.countLoaded();
        if (loaded === 0)
            mod.onReady();
        else
            setTimeout(function () { mod.waitForAll(mod) }, 10);
    }
    // arma un array de scripts
    for (var i = 0; i < modules.length; i++) {
        mod.lstModules[i] = Module(modules[i]);
    }
    // carga cada uno de los scripts
    for (var i = 0; i < mod.lstModules.length; i++) {
        mod.lstModules[i].load(function (nombre) {
            mod.waitForAll(mod)
        });
    }
    return mod;
}
