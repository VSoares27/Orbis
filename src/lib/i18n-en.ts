/**
 * Traduções para inglês (chave = texto em português exatamente como aparece).
 *
 * `EN_EXACT` cobre textos fixos. `EN_PATTERNS` cobre textos montados com
 * números, datas e nomes (recomendações do simulador, alertas, datas...).
 * Para conferir o que falta, abra o app com `?lang=en` e veja
 * `window.__orbisMissingI18n` no console.
 */

type Translate = (text: string) => string;
export type Pattern = [RegExp, (match: RegExpMatchArray, t: Translate) => string];

const MONTHS: Record<string, string> = {
  jan: 'Jan', fev: 'Feb', mar: 'Mar', abr: 'Apr', mai: 'May', jun: 'Jun',
  jul: 'Jul', ago: 'Aug', set: 'Sep', out: 'Oct', nov: 'Nov', dez: 'Dec',
};
const MONTHS_LONG: Record<string, string> = {
  janeiro: 'January', fevereiro: 'February', março: 'March', abril: 'April', maio: 'May',
  junho: 'June', julho: 'July', agosto: 'August', setembro: 'September', outubro: 'October',
  novembro: 'November', dezembro: 'December',
};
const WEEKDAYS: Record<string, string> = {
  dom: 'Sun', seg: 'Mon', ter: 'Tue', qua: 'Wed', qui: 'Thu', sex: 'Fri', sáb: 'Sat', sab: 'Sat',
};
const MONTH_NUMBER = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTH_RE = '(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)';

/** "1,20" → "1.20" (decimal em inglês). */
const num = (value: string) => value.replace(/(\d),(\d)/g, '$1.$2');
/** "fev"/"FEV" → "Feb". */
const month = (value: string) => {
  const en = MONTHS[value.toLowerCase()] ?? value;
  return value === value.toUpperCase() ? en.toUpperCase() : en;
};
/** "11/02" → "Feb 11". */
const ddmm = (value: string) => {
  const [day, mon] = value.split('/').map(Number);
  return MONTH_NUMBER[mon] ? `${MONTH_NUMBER[mon]} ${day}` : value;
};
/** "11/02, 21/02 e 01/03" → "Feb 11, Feb 21 and Mar 1". */
const dateList = (value: string) =>
  value.replace(/\b\d{2}\/\d{2}\b/g, ddmm).replace(/ e /g, ' and ');
/** "8 safras" etc. */
const seasons = (n: string) => (n === '1' ? '1 season' : `${n} seasons`);

export const EN_EXACT: Record<string, string> = {
  // Navegação e geral
  'Início': 'Home',
  'Clima': 'Weather',
  'Lavouras': 'Crops',
  'Caderneta': 'Logbook',
  'Plantações': 'Fields',
  PT: 'PT',
  EN: 'EN',
  'Serra Talhada': 'Serra Talhada',
  // Unidades e nomes próprios (ficam iguais)
  '°C': '°C', mm: 'mm', 'km/h': 'km/h', 'kWh/m²': 'kWh/m²', ha: 'ha', 'mm/dia': 'mm/day',
  'orbis.db': 'orbis.db', 'AG 1051': 'AG 1051', Carioca: 'Carioca', 'Brasília': 'Brasília', Magali: 'Magali',
  'Máx.': 'Max', '° · Mín.': '° · Min',
  '(com': '(with', 'mm de chuva).': 'mm of rain).',
  'Nenhuma plantação anotada': 'No fields yet',
  'Cadastre o que você plantou para começar o acompanhamento.': 'Add what you planted to start tracking it.',
  PE: 'PE',
  'Ver todas': 'See all',
  'Ver lavouras': 'See crops',
  'Ver clima': 'See weather',
  'Ver detalhes': 'See details',
  'Ocultar': 'Hide',
  'Entendi': 'Got it',
  'Cancelar': 'Cancel',
  'Fechar': 'Close',
  'Excluir': 'Delete',
  'Apagar': 'Delete',
  'Novo': 'New',
  'Nova': 'New',
  'Tentar novamente': 'Try again',
  'Tente novamente em instantes.': 'Please try again in a moment.',
  'Preparando seus dados locais...': 'Preparing your local data...',
  'Página não encontrada': 'Page not found',
  'Esse endereço não existe no Orbis. Volte para o início para ver o clima e o simulador de plantio.':
    'This address does not exist in Orbis. Go back home to see the weather and the planting simulator.',
  'Ir para o início': 'Go to home',
  'BOM DIA': 'GOOD MORNING',
  'BOA TARDE': 'GOOD AFTERNOON',
  'BOA NOITE': 'GOOD EVENING',
  'Bom dia': 'Good morning',
  'Boa tarde': 'Good afternoon',
  'Boa noite': 'Good evening',

  // Local
  'Local padrão': 'Default location',
  'Localização atual': 'Current location',
  'Sua localização': 'Your location',
  'Região de Serra Talhada': 'Serra Talhada region',
  'Obtendo localização...': 'Getting location...',
  'Aguardando GPS': 'Waiting for GPS',
  'Coordenadas do aparelho': 'Device coordinates',
  'Precisamos da sua permissão para usar o clima e as simulações da sua região.':
    'We need your permission to use the weather and simulations for your area.',
  'A permissão de localização foi bloqueada. Libere o acesso nas configurações do aparelho.':
    'Location permission was blocked. Allow access in your device settings.',
  'Não foi possível obter a localização do aparelho.': 'Could not get the device location.',
  'Não foi possível verificar ou atualizar a localização.': 'Could not check or update the location.',
  'Ative a localização (GPS) do aparelho para consultar o clima da sua área.':
    'Turn on the device location (GPS) to check the weather in your area.',

  // Clima (cartão principal e telas)
  'ATUALIZANDO...': 'UPDATING...',
  'Céu aberto': 'Clear sky',
  'Parcialmente nublado': 'Partly cloudy',
  'Chuva': 'Rain',
  'Tempestade': 'Storm',
  'Tempo seco': 'Dry weather',
  'Umidade': 'Humidity',
  'Vento': 'Wind',
  'NASA POWER': 'NASA POWER',
  'DEMO': 'DEMO',
  'Clima & Solo': 'Weather & Soil',
  'Sem dados de clima': 'No weather data',
  'Sem dados do tempo agora': 'No weather data right now',
  'Não foi possível carregar as informações do tempo agora.': 'Could not load the weather right now.',
  'Modo de exemplo': 'Sample mode',
  'Sem conexão no momento. Mostrando dados de exemplo da sua região.':
    'No connection right now. Showing sample data for your area.',
  'Sem sinal no momento. Mostrando dados de exemplo da sua região.':
    'No signal right now. Showing sample data for your area.',
  'Não foi possível consultar a NASA POWER. Exibindo dados demonstrativos.':
    'Could not reach NASA POWER. Showing demo data.',
  'Chuva nos últimos 7 dias': 'Rain in the last 7 days',
  'Quanto choveu por dia na sua região': 'Daily rainfall in your area',
  'somados na semana': 'total this week',
  'Chuva no dia (mm)': 'Daily rain (mm)',
  'Dia mais recente': 'Most recent day',
  'Resumo da semana': 'Week summary',
  'Médias registradas na sua propriedade': 'Averages recorded at your farm',
  'Temperatura média': 'Average temperature',
  'Variação de calor': 'Temperature range',
  'Umidade do ar': 'Air humidity',
  'Força do vento': 'Wind speed',
  'Força do sol': 'Sunlight',
  'Força do sol hoje': 'Sunlight today',
  'Água que seca da terra': 'Water lost from the soil',
  'O que isso significa': 'What this means',
  'Dicas práticas para cuidar da sua roça': 'Practical tips for your field',
  'Sobre esses números': 'About these numbers',
  'Os dados vêm dos satélites da NASA para a sua região e ajudam a planejar irrigação e época de plantio.':
    'The data comes from NASA satellites for your area and helps plan irrigation and planting time.',
  'Dados NASA POWER': 'NASA POWER data',
  'Dados demonstrativos': 'Demo data',
  'Observações por satélite da NASA para a sua localização.': 'NASA satellite observations for your location.',
  'Sem conexão com a NASA POWER. Exibindo uma série de exemplo.':
    'No connection to NASA POWER. Showing a sample series.',
  'Entenda a fonte de dados': 'About the data source',
  'Evite passar defensivo hoje': 'Avoid spraying today',
  'Bom horário para aplicar defensivo': 'Good time to spray',
  'Cuidado com mofo e ferrugem': 'Watch out for mildew and rust',
  'Pouco risco de mofo nas folhas': 'Low risk of leaf mildew',
  'Sol bom para secar colheita': 'Good sun for drying the harvest',
  'Secagem mais devagar': 'Slower drying',
  'Bastante sol para ajudar o crescimento da planta e secar os grãos.':
    'Plenty of sun to help the plants grow and dry the grain.',
  'Pouco sol nos últimos dias; tenha cuidado extra ao secar grãos e cuidar de mudas.':
    'Little sun in recent days; take extra care drying grain and tending seedlings.',
  'Jan': 'Jan', 'Fev': 'Feb', 'Mar': 'Mar', 'Abr': 'Apr', 'Mai': 'May', 'Jun': 'Jun',
  'Jul': 'Jul', 'Ago': 'Aug', 'Set': 'Sep', 'Out': 'Oct', 'Nov': 'Nov', 'Dez': 'Dec',

  // Alertas e irrigação
  'INFORMAÇÃO': 'INFO',
  'ATENÇÃO': 'WARNING',
  'CRÍTICO': 'CRITICAL',
  'Avisos da propriedade': 'Farm alerts',
  'Chuva forte registrada': 'Heavy rain recorded',
  'Atenção a doenças fúngicas': 'Watch for fungal diseases',
  'Evite pulverização': 'Avoid spraying',
  'Condições estáveis': 'Stable conditions',
  'Sem alertas de clima para a sua região nesta semana.': 'No weather alerts for your area this week.',
  'Aguardando a leitura de clima para gerar a recomendação.': 'Waiting for weather data to make a recommendation.',
  'Sem necessidade de irrigação hoje': 'No irrigation needed today',
  'A chuva recente cobre a perda de água do solo.': 'Recent rain covers the water lost by the soil.',
  'Irrigação leve recomendada': 'Light irrigation recommended',
  'Atenção à irrigação': 'Irrigation needed',

  // Início
  'Chuva nos últimos 7 dias ': 'Rain in the last 7 days',
  'Suas plantações': 'Your fields',
  'DICA DE HOJE PARA A ROÇA': "TODAY'S FIELD TIP",
  'Simular plantio e ver clima': 'Simulate planting and see weather',
  'Colheita': 'Harvest',

  // Simulador
  'Simulador de Plantio': 'Planting Simulator',
  'Veja como o clima deve se comportar na sua safra': 'See how the weather may behave during your season',
  '1. O que você vai plantar?': '1. What will you plant?',
  '2. Quando vai plantar?': '2. When will you plant?',
  '3. Como estará o ano?': '3. What kind of year?',
  'Milho': 'Maize',
  'Feijão': 'Beans',
  'Feijão-caupi': 'Cowpea',
  'Soja': 'Soybean',
  'Mandioca': 'Cassava',
  'Mais chuva': 'Wetter',
  'Normal': 'Normal',
  'Mais seco': 'Drier',
  'Confirmar data': 'Confirm date',
  'Consultando dados de chuva e temperatura da região...': 'Fetching rainfall and temperature data for the area...',
  'Não foi possível carregar os dados do clima agora. Tente novamente.':
    'Could not load the weather data right now. Please try again.',
  'Não foi possível obter os dados históricos de chuva e temperatura.':
    'Could not get the historical rainfall and temperature data.',
  'Época boa': 'Good time',
  'Atenção': 'Caution',
  'Risco alto': 'High risk',
  'Melhor época para plantar:': 'Best time to plant:',
  'começando em': 'starting in',
  'a chance de boa colheita sobe para': 'the chance of a good harvest rises to',
  'ciclo normal, cerca de 140 dias': 'normal cycle, about 140 days',
  'Dados da NASA POWER salvos no app (acessados em 14/11/2026), usados porque a consulta online falhou.':
    'NASA POWER data saved in the app (accessed on Nov 14, 2026), used because the online request failed.',

  // Lavouras
  'Minhas plantações': 'My fields',
  'Acompanhe o crescimento, a água e a colheita de cada roça.': 'Track growth, water and harvest for each field.',
  'plantações': 'fields',
  'hectares': 'hectares',
  'próxima colheita': 'next harvest',
  'Suas anotações ficam salvas no celular, mesmo sem sinal na roça.':
    'Your notes are saved on the phone, even without signal in the field.',
  'Todas': 'All',
  'Boas': 'Good',
  'Saudável': 'Healthy',
  'Pronto para colheita': 'Ready to harvest',
  'Crescimento da roça': 'Crop growth',
  'Colheita prevista': 'Expected harvest',
  'Água recomendada': 'Recommended water',
  'Próxima tarefa': 'Next task',
  'Anotar serviço': 'Log a task',
  'DICA PARA A TERRA': 'SOIL TIP',
  'Alterne o que você planta em cada safra para diminuir pragas e manter a terra forte. O app usa o tempo de cada cultura para avisar a hora certa de cuidar e colher.':
    'Rotate what you plant each season to reduce pests and keep the soil strong. The app uses each crop’s cycle to tell you when to care for it and harvest.',
  'Nova plantação': 'New field',
  'Anote o que você plantou para acompanhar até a colheita.': 'Record what you planted to follow it until harvest.',
  'O que vai plantar': 'What will you plant',
  'Tipo / Semente': 'Type / Seed',
  'Tamanho da área (hectares)': 'Area size (hectares)',
  'Ajuda a calcular quanta água e colheita esperar.': 'Helps estimate how much water and harvest to expect.',
  'Fica salvo no seu celular para você consultar mesmo sem internet na roça.':
    'Saved on your phone so you can check it even without internet in the field.',
  'Salvar plantação': 'Save field',
  'Ex.: Milho': 'e.g. Maize',
  'Ex.: Milho verde ou criouro': 'e.g. Green maize or heirloom',
  'Ex.: 1,5': 'e.g. 1.5',
  'Não foi possível carregar suas plantações agora.': 'Could not load your fields right now.',
  'Não foi possível salvar': 'Could not save',
  'Plantação anotada por você. Atualize as informações conforme a roça for crescendo.':
    'Field added by you. Update the information as the crop grows.',
  'Comum da região': 'Local variety',
  'Acompanhar nascimento das mudas': 'Watch seedling emergence',
  'Adubação de cobertura': 'Side-dress fertilizing',
  'Verificar irrigação': 'Check irrigation',
  'Programar colheita': 'Plan the harvest',
  'Monitorar pragas': 'Monitor pests',
  'Cenoura': 'Carrot',
  'Pimentão': 'Bell pepper',
  'Boa umidade no solo após as chuvas da semana. Acompanhar aparecimento de lagarta-do-cartucho.':
    'Good soil moisture after this week’s rain. Watch for fall armyworm.',
  'Solo com déficit hídrico leve. Priorize o turno da manhã para reduzir perdas por evaporação.':
    'Soil is slightly dry. Water in the morning to reduce evaporation losses.',
  'Ciclo próximo do fim. Separe os lotes por tamanho para melhor preço no mercado.':
    'Cycle nearly over. Sort lots by size for a better market price.',
  'Plantas vigorosas. Faça a inspeção semanal de ácaros e trips nas folhas novas.':
    'Vigorous plants. Check new leaves weekly for mites and thrips.',
  'Remover plantação': 'Remove field',
  'Serviço anotado': 'Task logged',
  'A anotação já está salva na sua caderneta.': 'The note is already saved in your logbook.',
  'Erro': 'Error',
  'Não foi possível apagar essa plantação agora.': 'Could not delete this field right now.',

  // Caderneta
  'Caderneta do campo': 'Field logbook',
  'Anote irrigação, adubação e outros manejos de cada lavoura.': 'Log irrigation, fertilizing and other tasks for each field.',
  'Banco local SQLite': 'Local SQLite database',
  'Lavouras e manejos ficam salvos no aparelho, mesmo sem internet.': 'Fields and tasks are saved on the device, even offline.',
  'registros': 'entries',
  'este mês': 'this month',
  'último': 'latest',
  'Carregando a caderneta...': 'Loading the logbook...',
  'POR QUE ANOTAR?': 'WHY KEEP A LOG?',
  'O histórico ajuda a comparar resultados entre ciclos, planejar a próxima safra e comprovar boas práticas de manejo.':
    'The history helps compare results between cycles, plan the next season and prove good farming practices.',
  'Irrigação': 'Irrigation',
  'Adubação': 'Fertilizing',
  'Pulverização': 'Spraying',
  'Plantio': 'Planting',
  'Outro manejo': 'Other task',
  'Registrar manejo': 'Log a task',
  'Lavoura': 'Field',
  'O que foi feito?': 'What was done?',
  'Observações': 'Notes',
  'Ex.: 20 mm no início da manhã': 'e.g. 20 mm early in the morning',
  'Este registro será salvo no SQLite do aparelho.': 'This entry will be saved in the device’s SQLite database.',
  'Salvar na caderneta': 'Save to logbook',
  'Cadastre uma lavoura antes de registrar o manejo.': 'Add a field before logging a task.',
  'Excluir registro': 'Delete entry',
  'Não foi possível excluir': 'Could not delete',
  'Nenhum registro ainda': 'No entries yet',
  'Irrigação de 20 mm no início da manhã para reduzir evaporação.': '20 mm of irrigation early in the morning to reduce evaporation.',
  'Adubação de cobertura com 120 kg/ha de ureia.': 'Side-dressing with 120 kg/ha of urea.',
  'Pulverização preventiva contra tripes nas folhas novas.': 'Preventive spraying against thrips on new leaves.',
  'Amostragem de raízes para avaliar o ponto de colheita.': 'Root sampling to check harvest readiness.',
  'Plantio concluído com espaçamento de 0,80 m entre linhas.': 'Planting done with 0.80 m row spacing.',

  // Mercado (oculto nas abas)
  'Mercado': 'Market',
  'Produtos da Agricultura Familiar perto de você.': 'Family-farm products near you.',
  'Anunciar': 'Sell',
  'Venda direta, sem atravessador': 'Direct sales, no middleman',
  'Aproxime produtores e consumidores da sua região e valorize o preço justo.':
    'Connect producers and consumers in your area and value a fair price.',
  'Busque por produto, produtor ou cidade': 'Search by product, producer or city',
  'Todos': 'All',
  'Frutas': 'Fruits',
  'Verduras': 'Vegetables',
  'Grãos': 'Grains',
  'Laticínios': 'Dairy',
  'Ofertas disponíveis': 'Available offers',
  'Nenhum produto encontrado': 'No products found',
  'Tenho interesse': "I'm interested",
  'Preço por kg': 'Price per kg',
  'Prévia do mercado. Preços, ofertas e contatos são fictícios e serão carregados do backend quando a integração estiver pronta.':
    'Market preview. Prices, offers and contacts are fictional and will come from the backend once integrated.',
  'TESTE APENAS PARA CONHECIMENTO': 'DEMO ONLY',
  'Anunciar produto': 'Sell a product',
  'Contato': 'Contact',
  'Tomate italiano': 'Italian tomato',
  'Milho verde': 'Green maize',
  'Queijo minas frescal': 'Fresh Minas cheese',
  'Mamão papaia': 'Papaya',
  'Ovos caipiras': 'Free-range eggs',
};

export const EN_PATTERNS: Pattern[] = [
  // Número com unidade: "0,6 mm", "12.4 km/h", "43%"
  [/^(-?[\d.,]+) ?(mm|km\/h|kWh\/m²|ha|°C|%)$/, (m) => `${num(m[1])} ${m[2]}`.replace(' %', '%')],
  // Datas
  [new RegExp(`^(\\d{1,2}) ${MONTH_RE}$`, 'i'), (m) => `${month(m[2])} ${Number(m[1])}`],
  [new RegExp(`^(dom|seg|ter|qua|qui|sex|s[aá]b), (\\d{1,2}) ${MONTH_RE}$`, 'i'), (m) =>
    `${(WEEKDAYS[m[1].toLowerCase()] ?? m[1]).toUpperCase()}, ${month(m[3])} ${Number(m[2])}`],
  [/^(dom|seg|ter|qua|qui|sex|s[aá]b)$/i, (m) => {
    const en = WEEKDAYS[m[1].toLowerCase()] ?? m[1];
    return m[1] === m[1].toLowerCase() ? en.toLowerCase() : en;
  }],
  [new RegExp(`^(\\d{1,2}) de ${MONTH_RE} de (\\d{4})$`, 'i'), (m) => `${month(m[2])} ${Number(m[1])}, ${m[3]}`],
  [new RegExp(`^(\\d{1,2}) ${MONTH_RE} (\\d{4})$`, 'i'), (m) => `${month(m[2])} ${Number(m[1])}, ${m[3]}`],
  [/^(\d{2})\/(\d{2}) às (\d{2}:\d{2})$/, (m) => `${ddmm(`${m[1]}/${m[2]}`)}, ${m[3]}`],
  [/^Atualizado em (.+)$/, (m, t) => `Updated ${t(m[1])}`],
  [/^Dados de (.+) · consulta em (.+)$/, (m, t) => `Data from ${t(m[1])} · checked ${t(m[2])}`],
  [/^Hoje · (.+)$/, (m, t) => `Today · ${t(m[1])}`],
  [/^Plantado em (.+) · precisa de (\d+) mm de água$/, (m, t) => `Planted ${t(m[1])} · needs ${m[2]} mm of water`],
  [/^(.+) · (\d{1,2} de \w+ de \d{4})$/, (m, t) => `${t(m[1])} · ${t(m[2])}`],
  [/^(.+) · ([\d,]+) ha$/, (m, t) => `${t(m[1])} · ${num(m[2])} ha`],
  [new RegExp(`^${MONTH_RE}$`), (m) => month(m[1])],
  [/^(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)$/i,
    (m) => MONTHS_LONG[m[1].toLowerCase()] ?? m[1]],

  // Contadores e filtros
  [/^(\d+) culturas em acompanhamento$/, (m) => `${m[1]} crops being tracked`],
  [/^(.+) · (\d+)$/, (m, t) => `${t(m[1])} · ${m[2]}`],
  [/^(\d+) (produto encontrado|produtos encontrados)$/, (m) => `${m[1]} ${m[1] === '1' ? 'product' : 'products'} found`],

  // Simulador
  [/^Nota (\d+) de 100$/, (m) => `Score ${m[1]} out of 100`],
  [/^Plantio em (\S+) · Colheita em (\S+)$/, (m, t) => `Planting in ${t(m[1])} · Harvest in ${t(m[2])}`],
  [/^Chuva na safra \((.+)%\)$/, (m) => `Season rainfall (${num(m[1])}%)`],
  [/^Calor médio \((.+)°C\)$/, (m) => `Average heat (${num(m[1])}°C)`],
  [/^mm \(antes (\d+)\)$/, (m) => `mm (avg. ${m[1]})`],
  [/^°C \(antes ([\d.,]+)\)$/, (m) => `°C (avg. ${num(m[1])})`],
  [/^\(com (\d+) mm de chuva\)\.$/, (m) => `(with ${m[1]} mm of rain).`],
  [/^Chuva esperada por mês \(em verde: meses da sua safra de (.+)\)$/, (m, t) =>
    `Expected rain per month (in green: your ${t(m[1].charAt(0).toUpperCase() + m[1].slice(1)).toLowerCase()} season months)`],
  [/^Pode faltar cerca de (\d+) mm de chuva até a colheita\. Vale preparar irrigação ou plantar semente de ciclo mais rápido\.$/,
    (m) => `Rain may fall short by about ${m[1]} mm before harvest. Consider preparing irrigation or planting a faster-cycle seed.`],
  [/^Deve chover bastante \((\d+) mm\)\. Cuide do escoamento da água para não apodrecer a raiz\.$/,
    (m) => `Expect a lot of rain (${m[1]} mm). Take care of drainage so the roots don't rot.`],
  [/^Quantidade de chuva esperada \((\d+) mm\) na medida certa para o (.+)\.$/,
    (m, t) => `Expected rainfall (${m[1]} mm) is just right for ${t(m[2].charAt(0).toUpperCase() + m[2].slice(1)).toLowerCase()}.`],
  [/^Vai fazer calor acima do ideal \(([\d.,]+)°C\)\. Deixe palhada na terra para segurar a umidade\.$/,
    (m) => `It will be hotter than ideal (${num(m[1])}°C). Leave mulch on the soil to hold moisture.`],
  [/^Temperatura agradável \(([\d.,]+)°C\) para a planta crescer forte e dar boa colheita\.$/,
    (m) => `Pleasant temperature (${num(m[1])}°C) for the plant to grow strong and yield well.`],
  [/^Em Serra Talhada, quem plantou (.+) perto de (\d{2}\/\d{2}) nos últimos (\d+) anos: faltou chuva em (\d+) safras?, ficou apertado em (\d+) e choveu o bastante em (\d+) \(NASA POWER, (\d{4})–(\d{4})\)\.$/,
    (m, t) =>
      `In Serra Talhada, farmers who planted ${t(m[1].charAt(0).toUpperCase() + m[1].slice(1)).toLowerCase()} around ${ddmm(m[2])} in the last ${m[3]} years: rain fell short in ${seasons(m[4])}, was tight in ${m[5]} and was enough in ${m[6]} (NASA POWER, ${m[7]}–${m[8]}).`],
  [/^(Na época de plantio da região \(janeiro a março\), a|A) data com menos falta de chuva foi (.+?)(?: \((.+)\))?: faltou em (\d+) das últimas (\d+) safras\.$/,
    (m, t) =>
      `${m[1].startsWith('Na') ? 'In the regional planting season (January to March), the' : 'The'} date with the fewest short-rain seasons was ${dateList(m[2])}${m[3] ? ` (${t(m[3])})` : ''}: rain fell short in ${m[4]} of the last ${m[5]} seasons.`],
  [/^(Na época de plantio da região \(janeiro a março\), as|As) datas com menos falta de chuva foram (.+?)(?: \((.+)\))?: faltou em (\d+) das últimas (\d+) safras em cada uma\.$/,
    (m, t) =>
      `${m[1].startsWith('Na') ? 'In the regional planting season (January to March), the' : 'The'} dates with the fewest short-rain seasons were ${dateList(m[2])}${m[3] ? ` (${t(m[3])})` : ''}: rain fell short in ${m[4]} of the last ${m[5]} seasons at each.`],
  [/^Normal: média dos (\d+) anos de (\d{4}) a (\d{4})\.$/, (m) => `Normal: average of the ${m[1]} years from ${m[2]} to ${m[3]}.`],
  [/^(Mais chuva|Mais seco): média dos (\d+) anos com (mais|menos) chuva desde (\d{4}) \(([\d, ]+)\)\.(.*)$/,
    (m) => {
      const name = m[1] === 'Mais chuva' ? 'Wetter' : 'Drier';
      const kind = m[3] === 'mais' ? 'wettest' : 'driest';
      const recent = m[6].trim()
        .replace(/^Nenhum deles foi entre (\d{4}) e (\d{4})\.$/, 'None of them were between $1 and $2.')
        .replace(/^1 deles foi entre (\d{4}) e (\d{4})\.$/, '1 of them was between $1 and $2.')
        .replace(/^(\d+) deles foram entre (\d{4}) e (\d{4})\.$/, '$1 of them were between $2 and $3.');
      return `${name}: average of the ${m[2]} ${kind} years since ${m[4]} (${m[5]}).${recent ? ` ${recent}` : ''}`;
    }],

  // Alertas, irrigação e dicas
  [/^([\d.,]+) mm na última leitura\. Verifique drenagem e áreas sujeitas a encharcamento\.$/,
    (m) => `${num(m[1])} mm in the latest reading. Check drainage and areas prone to waterlogging.`],
  [/^Umidade média de ([\d.,]+)% na semana favorece fungos\. Vistorie as folhas baixas\.$/,
    (m) => `Average humidity of ${num(m[1])}% this week favors fungi. Inspect the lower leaves.`],
  [/^Vento médio de ([\d.,]+) km\/h pode causar deriva do produto\.$/,
    (m) => `Average wind of ${num(m[1])} km/h may cause spray drift.`],
  [/^Reponha cerca de ([\d.,]+) mm, preferencialmente no início da manhã\.$/,
    (m) => `Replace about ${num(m[1])} mm, preferably early in the morning.`],
  [/^Déficit estimado de ([\d.,]+) mm\. Priorize as lavouras mais sensíveis\.$/,
    (m) => `Estimated deficit of ${num(m[1])} mm. Prioritize the most sensitive crops.`],
  [/^Vento de ([\d.,]+) km\/h pode espalhar o produto para fora da lavoura\.$/,
    (m) => `Wind of ${num(m[1])} km/h may carry the spray outside the field.`],
  [/^Vento calmo \(([\d.,]+) km\/h\), bom para aplicar sem desperdício\.$/,
    (m) => `Calm wind (${num(m[1])} km/h), good for spraying without waste.`],
  [/^Tempo muito úmido \(([\d.,]+)%\)\. Vale olhar as folhas de baixo da planta\.$/,
    (m) => `Very humid weather (${num(m[1])}%). Check the lower leaves of the plants.`],
  [/^Umidade controlada \(([\d.,]+)%\), sem perigo de doenças por excesso de água\.$/,
    (m) => `Humidity under control (${num(m[1])}%), no risk of disease from excess water.`],
  [/^• (.+)$/, (m, t) => `• ${t(m[1])}`],

  // Confirmações
  [/^Tem certeza que deseja apagar (.+)\? As anotações dessa plantação na caderneta também serão apagadas\.$/,
    (m, t) => `Are you sure you want to delete ${t(m[1])}? This field's logbook notes will also be deleted.`],
  [/^Remover "(.+)" de (.+)\?$/, (m, t) => `Remove "${t(m[1])}" from ${t(m[2])}?`],

  // Local sem nome de cidade
  [/^([\d,]+)° ([SN]) · ([\d,]+)° ([OL])$/, (m) => `${num(m[1])}° ${m[2]} · ${num(m[3])}° ${m[4] === 'O' ? 'W' : 'E'}`],

  // Mercado
  [/^([\d,.]+) (kg|dúzias) disponíveis$/, (m) => `${num(m[1])} ${m[2] === 'kg' ? 'kg' : 'dozen'} available`],
  [/^Preço por (.+)$/, (m) => `Price per ${m[1] === 'dúzia' ? 'dozen' : m[1]}`],
];
