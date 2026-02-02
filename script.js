const SUPABASE_URL = 'https://azkbmxotcwcqumogzepr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CvTnEkt4MbMvwuLqJnWj7w__0ue3BWy';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_gldKkGXtz__NoIojJSZBHg_0jGnbi-Q';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Регистрация
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signUp({ email, password });
    document.getElementById('auth-status').innerText = error ? 'Ошибка: ' + error.message : 'Успешно!';
}

// Вход
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('chat-section').style.display = 'block';
        loadMessages();
    } else {
        document.getElementById('auth-status').innerText = 'Ошибка: ' + error.message;
    }
}

// Отправка сообщения
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

// Загрузка сообщений
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

// Админ: поиск пользователя
async function adminFindUser() {
    const email = document.getElementById('search-email').value;
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    const resultDiv = document.getElementById('user-data');
    if (user) {
        resultDiv.innerHTML = `<strong>Найден:</strong> ${user.email}<br><strong>ID:</strong> ${user.id}`;
    } else {
        resultDiv.innerHTML = 'Не найден';
    }
}

// Админ: все сообщения
async function adminReadAllMessages() {
    const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

    const container = document.getElementById('all-messages');
    container.innerHTML = '<h4>Все сообщения:</h4>';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.style.borderBottom = '1px solid #ddd';
        div.innerHTML = `<strong>${new Date(msg.created_at).toLocaleString()}</strong><br>${msg.content}`;
        container.appendChild(div);
    });
}

// Автозагрузка
if (document.getElementById('messages')) {
    setInterval(loadMessages, 2000);
}