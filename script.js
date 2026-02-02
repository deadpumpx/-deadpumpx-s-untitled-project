// ================== КОНФИГУРАЦИЯ ==================
const SUPABASE_URL = 'https://mldsexrzrrvgplhibdyy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-NjEOi5cEJNDdklouCIylA_8VXmQBtP';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_ZuWHpzcXGtJwftK3_mIMhg_0E0GJb3k';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ================== ФУНКЦИИ ==================
async function signUp() {
    console.log('Функция signUp вызвана!');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signUp({ email, password });
    const statusEl = document.getElementById('auth-status');
    if (error) {
        statusEl.innerText = 'Ошибка: ' + error.message;
        console.error('SignUp Error:', error);
    } else {
        statusEl.innerText = 'Успешно! Проверь email.';
    }
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        document.getElementById('auth-status').innerText = 'Ошибка: ' + error.message;
        console.error('SignIn Error:', error);
    } else {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('chat-section').style.display = 'block';
        loadMessages();
    }
}

async function sendMessage() {
    const { data: { user } } = await supabase.auth.getUser();
    const message = document.getElementById('message').value;
    if (!user || !message) return;

    const { error } = await supabaseAdmin.from('messages').insert([
        { user_id: user.id, content: message }
    ]);
    if (!error) {
        document.getElementById('message').value = '';
        loadMessages();
    }
}

async function loadMessages() {
    const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
    const container = document.getElementById('messages');
    if (!container) return;
    container.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.textContent = `${new Date(msg.created_at).toLocaleTimeString()}: ${msg.content}`;
        container.appendChild(div);
    });
}

if (document.getElementById('messages')) {
    setInterval(loadMessages, 2000);
}