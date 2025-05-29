document.addEventListener('DOMContentLoaded', () => {
    // SECCIONES DE PANTALLAS
    const inicio = document.getElementById('pantalla-inicio');
    const login = document.getElementById('pantalla-login');
    const registro = document.getElementById('pantalla-registro');
    const juego = document.getElementById('pantalla-juego');
    const ranking = document.getElementById('pantalla-ranking');
    const restablecer = document.getElementById('pantalla-restablecer');

    // MOSTRAR TODO EN UNA PANTALLA
    function mostrar(seccion) {
        [inicio, login, registro, juego, ranking, restablecer].forEach(s => s.classList.add('oculto'));
        seccion.classList.remove('oculto');
    }

    // FUNCIONES DE NAVEGACION
    window.mostrarLogin = () => {
        document.getElementById('login-correo').value = '';
        document.getElementById('login-pass').value = '';
        mostrar(document.getElementById('pantalla-login'));
    };
    
    window.mostrarRegistro = () => {
        document.getElementById('reg-nombre').value = '';
        document.getElementById('reg-apellido').value = '';
        document.getElementById('reg-correo').value = '';
        document.getElementById('reg-pass').value = '';
        mostrar(document.getElementById('pantalla-registro'));
    };
   
 // MOSTRAR RESTABLECER CONTRA
    window.mostrarRestablecer = () => {
        document.getElementById('correo-restablecer').value = '';
        document.getElementById('nueva-pass').value = '';
        mostrar(document.getElementById('pantalla-restablecer'));
    };
    
    window.cerrarSesion = () => mostrar(inicio);
    //MOSTRAR RANKING DE JUGADORES
    window.mostrarRanking = async () => {
        const tablaBody = document.querySelector('#tabla-ranking tbody');
        tablaBody.innerHTML = '';
    
        try {
            const token = localStorage.getItem('token');
    
            const respuesta = await fetch('http://165.73.244.26:3000/api/game/ranking', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const datos = await respuesta.json();
    
            if (respuesta.ok) {
                datos.ranking.forEach((jugador, index) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${jugador.nombre} ${jugador.apellido}</td>
                        <td>${jugador.coins}</td>
                    `;
                    tablaBody.appendChild(fila);
                });
    
                document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculto'));
                document.getElementById('pantalla-ranking').classList.remove('oculto');
            } else {
                manejarErrorTokenExpirado(datos);
                alert('No se pudo obtener el ranking');
            }
        } catch (error) {
            console.error(error);
            alert('Error al cargar el ranking');
        }
    };    
    //MOSTRAR HISTORIAL DEL USUARIO
    window.mostrarHistorial = async () => {
        const tablaBody = document.querySelector('#tabla-historial tbody');
        tablaBody.innerHTML = '';
    
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`http://165.73.244.26:3000/api/game/historial/${window.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const datos = await respuesta.json();
    
            if (respuesta.ok) {
                datos.historial.forEach(apuesta => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${apuesta.tipo_apuesta}</td>
                        <td>${apuesta.valor_apostado}</td>
                        <td>${apuesta.monto_apostado}</td>
                        <td>${apuesta.resultado}</td>
                        <td>${apuesta.coins_ganados}</td>
                        <td>${apuesta.numero_ganador}</td>
                        <td>${apuesta.color_ganador}</td>
                        <td>${new Date(apuesta.fecha).toLocaleString()}</td>
                    `;
                    tablaBody.appendChild(fila);
                });
    
                document.getElementById('modal-historial').style.display = 'block';
            } else {
                manejarErrorTokenExpirado(datos);
                alert('No se pudo obtener el historial');
            }
        } catch (error) {
            console.error(error);
            alert('Error al cargar el historial');
        }
    };
    
    window.cerrarModalHistorial = () => {
        document.getElementById('modal-historial').style.display = 'none';
    };
    
    window.volverAlJuego = () => mostrar(juego);

    mostrar(inicio);
    dibujarRuleta();
});
//REGISTRAR USUARIO
window.registrarUsuario = async () => {
    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellido = document.getElementById('reg-apellido').value.trim();
    const correo = document.getElementById('reg-correo').value.trim();
    // Validar formato básico del correo
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        alert('Ingresa un correo electrónico válido.');
        return;
    }

    // Verificar correo
    const dominiosInvalidos = ['gamil.com', 'hotmial.com', 'yaho.com', 'gmai.com'];
    const dominioUsuario = correo.split('@')[1];

    if (dominiosInvalidos.includes(dominioUsuario)) {
        alert('Ingresa un correo electrónico válido.');
        return;
    }

    const contrasena = document.getElementById('reg-pass').value.trim();

    if (!nombre || !apellido || !correo || !contrasena) {
        alert('Por favor, completa todos los campos');
        return;
    }

    try {
        const respuesta = await fetch('http://165.73.244.26:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, apellido, correo, contrasena })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert('Registro exitoso, ahora inicia sesión');
            mostrarLogin();
        } else {
            alert(`Error: ${datos.mensaje}`);
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
};
//INICIAR SESION
window.iniciarSesion = async () => {
    const correo = document.getElementById('login-correo').value.trim();
    const contrasena = document.getElementById('login-pass').value.trim();

    if (!correo || !contrasena) {
        alert('Por favor, completa todos los campos');
        return;
    }

    try {
        const respuesta = await fetch('http://165.73.244.26:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert('Inicio de sesión exitoso');

            // Guardar datos del jugador
            const usuario = datos.usuario;
            window.usuarioActual = usuario;
            localStorage.setItem('token', datos.token);
            
            // Mostrar datos en el dashboard
            document.getElementById('nombre-usuario').textContent = `${usuario.nombre} ${usuario.apellido}`;
            document.getElementById('coins-usuario').textContent = usuario.coins;

            // Cambiar a pantalla del juego
            mostrarJuego();
        } else {
            alert(`Error: ${datos.mensaje}`);
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor');
    }
};
// Funcion global para cambiar a la pantalla del juego
window.mostrarJuego = () => {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculto'));
    document.getElementById('pantalla-juego').classList.remove('oculto');
};
//Funcion para regresar a la pantalla del juego
window.volverAlJuego = () => {
    // Ocultar las pantallas primero
    document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculto'));

    // Historial y Ranking ocultos
    document.getElementById('pantalla-historial').classList.add('oculto');
    document.getElementById('pantalla-ranking').classList.add('oculto');

    // Mostrar la pantalla del juego
    document.getElementById('pantalla-juego').classList.remove('oculto');
};

// Restablecer Contra
window.restablecerContrasena = async () => {
    const correo = document.getElementById('correo-restablecer').value.trim();
    const nuevaContrasena = document.getElementById('nueva-pass').value.trim();

    if (!correo || !nuevaContrasena) {
        alert('Por favor, completa ambos campos.');
        return;
    }

    try {
        const respuesta = await fetch('http://165.73.244.26:3000/api/auth/restablecer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, nuevaContrasena })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert('Contraseña restablecida con éxito. Ahora puedes iniciar sesión.');
            mostrarLogin();
        } else {
            alert(`Error: ${datos.mensaje}`);
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor');
    }
};

//APOSTAR
window.apostar = async () => {
    if (window.contadorJugadas >= 5) {
        alert('Has alcanzado el limite de 5 jugadas.');
        return;
    }
    const tipoApuesta = document.getElementById('tipo-apuesta').value;
    const valorApostado = document.getElementById('valor-apostado').value.trim().toLowerCase();
    const montoApostado = parseInt(document.getElementById('monto-apostado').value);

    // Validar datos vacios
    if (!valorApostado || isNaN(montoApostado) || montoApostado <= 0) {
        alert('Ingresa un monto válido y un valor de apuesta.');
        return;
    }

    // Validar el tipo de apuesta
    if (tipoApuesta === 'color') {
        const coloresValidos = ['rojo', 'negro', 'verde'];
        if (!coloresValidos.includes(valorApostado)) {
            alert('Si apuestas al color, debes escribir: rojo, negro o verde.');
            return;
        }
    } else if (tipoApuesta === 'numero') {
        const numero = parseInt(valorApostado);
        if (isNaN(numero) || numero < 0 || numero > 36) {
            alert('Si apuestas a número, debes escribir un número entre 0 y 36.');
            return;
        }
    }

    if (montoApostado > window.usuarioActual.coins) {
        alert('No tienes suficientes COINS para esta apuesta.');
        return;
    }

    try {
        // Desactiva el boton antes de girar
        document.querySelector('#ruleta-container button').disabled = true;

        const token = localStorage.getItem('token');
   	
        const respuesta = await fetch('http://165.73.244.26:3000/api/game/apostar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                usuario_id: window.usuarioActual.id,
                tipo_apuesta: tipoApuesta,
                valor_apostado: valorApostado,
                monto_apostado: montoApostado
            })
        });
        

        const datos = await respuesta.json();

        if (respuesta.ok) {
    const saldoActual = window.usuarioActual.coins;
    const saldoTemporal = saldoActual - montoApostado;
    actualizarCoins(saldoTemporal);

            animarGiro(datos.numeroGanador, () => {
                mostrarResultadoRuleta(
                    datos.numeroGanador,
                    datos.colorGanador,
                    datos.mensaje,
                    datos.coins_ganados,
                    datos.nuevoSaldo,
                );
            });
        } else {
            manejarErrorTokenExpirado(datos);
            alert(`Error: ${datos.mensaje}`);
            // Reactivar boton en caso de error
            document.querySelector('#ruleta-container button').disabled = false;
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor');
        // Reactivar boton si hay error de conexion
        document.querySelector('#ruleta-container button').disabled = false;
    }
};

//DIBUJAR RULETA
const canvas = document.getElementById('ruletaCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radio = 180;

// NUMEROS EN RULETA
const numeros = [0, ...Array.from({ length: 36 }, (_, i) => i + 1)];
const colores = numeros.map(n => {
    if (n === 0) return 'green';
    return [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(n) ? 'red' : 'black';
});


function dibujarRuleta(anguloRotacion = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = numeros.length;
    const anguloPorSector = (2 * Math.PI) / total;

    for (let i = 0; i < total; i++) {
        const inicio = i * anguloPorSector + anguloRotacion;
        const fin = inicio + anguloPorSector;

        // Color de fondo
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radio, inicio, fin);
        ctx.fillStyle = colores[i];
        ctx.fill();
        ctx.closePath();

        // Número
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(inicio + anguloPorSector / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(numeros[i], radio - 10, 5);
        ctx.restore();
    }

    // Círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
}
//ANIMAR RULETA
let anguloActual = 0;
let velocidad = 0;
let animando = false;

function animarGiro(numeroGanador, callback) {
    if (animando) return;

    anguloActual = 0;
    animando = true;

    const gradosPorNumero = 360 / 37;
    const vueltas = 5;
    const anguloObjetivo = vueltas * 360 + (numeroGanador * gradosPorNumero);
    const anguloObjetivoRad = (anguloObjetivo * Math.PI) / 180;

    velocidad = 0.3;

    function animacion() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        anguloActual += velocidad;
        if (anguloActual >= anguloObjetivoRad) {
            anguloActual = anguloObjetivoRad;
            dibujarRuleta(anguloActual);
            animando = false;
            if (callback) callback();
            return;
        }

        dibujarRuleta(anguloActual);
        requestAnimationFrame(animacion);
    }

    animacion();
}

//ANIMAR GIRO
function girarAnimacionRuleta(numeroGanador) {
    
    const ruleta = document.getElementById('ruleta-img');

    // Calcular angulo donde se deteniene la ruleta
    const gradosPorNumero = 360 / 36;
    const anguloFinal = 3600 + (numeroGanador * gradosPorNumero); // Minimo 10 vueltas con el numero exacto

    ruleta.style.transition = 'transform 3s ease-out';
    ruleta.style.transform = `rotate(${anguloFinal}deg)`;
}

//MOSTRAR RESULTADO DE RULETA
function mostrarResultadoRuleta(numero, color, mensaje, coinsGanados, nuevoSaldo) {
    const resultadoDiv = document.getElementById('resultado-jugada');

    resultadoDiv.innerHTML = `
        <h3>Número ganador: ${numero} (${color})</h3>
        <p>${mensaje}</p>
        <p>Ganaste: ${coinsGanados} COINS</p>
        <button id="btnAceptarResultado">Aceptar</button>
    `;

    // Agregar evento al botón para actualizar COINS
    document.getElementById('btnAceptarResultado').addEventListener('click', () => {
        resultadoDiv.innerHTML = '';
        actualizarCoins(nuevoSaldo);
        document.querySelector('#ruleta-container button').disabled = false;
    });
}
//ACTUALIZAR COINS
function actualizarCoins(nuevoSaldo) {
    window.usuarioActual.coins = nuevoSaldo;
    document.getElementById('coins-usuario').textContent = nuevoSaldo;
}

//MOSTRAR MENSAJE DE ERROR AL EXPIRAR TOKEN
function manejarErrorTokenExpirado(error) {
    if (error?.mensaje?.toLowerCase().includes("token")) {
        alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        localStorage.removeItem('token');
        window.usuarioActual = null;
        mostrarLogin();
    }
}

function togglePassword(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}
