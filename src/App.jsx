import { useEffect, useRef, useState } from 'react';

const API_URL = 'https://www.thecocktaildb.com/api/json/v1/1';
const QUICK_INGREDIENTS = ['vodka', 'gin', 'rum', 'tequila', 'lemon'];

// Превращаем 15 разрозненных полей TheCocktailDB в удобный массив ингредиентов.
function normalizeCocktail(drink) {
  if (!drink) return null;

  const ingredients = Array.from({ length: 15 }, (_, index) => {
    const number = index + 1;
    const name = drink[`strIngredient${number}`]?.trim();
    const measure = drink[`strMeasure${number}`]?.trim();
    return name ? { name, measure: measure || '' } : null;
  }).filter(Boolean);

  return {
    id: drink.idDrink,
    name: drink.strDrink || 'Коктейль без названия',
    category: drink.strCategory || '',
    alcoholic: drink.strAlcoholic || '',
    glass: drink.strGlass || '',
    instructions: drink.strInstructions || '',
    image: drink.strDrinkThumb || '',
    ingredients,
  };
}

async function fetchCocktailApi(path) {
  const response = await fetch(`${API_URL}/${path}`);
  if (!response.ok) {
    throw new Error('Сервис временно недоступен. Попробуйте ещё раз.');
  }
  return response.json();
}

function pluralizeCocktails(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (last === 1 && lastTwo !== 11) return 'коктейль';
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'коктейля';
  return 'коктейлей';
}

function CocktailMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="brand-mark">
      <path d="M8 10h24L21 23v8h7v3H12v-3h7v-8L8 10Z" fill="currentColor" />
      <path d="M13 14h14" stroke="#f5f5ef" strokeWidth="2" strokeLinecap="round" />
      <circle cx="27" cy="8" r="3" fill="#f28a5b" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.5 15.5 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ diagonal = false }) {
  return diagonal ? (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M6 5h9v9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3.5 10h12m-4.5-4.5 4.5 4.5-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroIllustration() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art-orbit orbit-one" />
      <div className="hero-art-orbit orbit-two" />
      <div className="hero-art-note">GOOD TASTE<br />STARTS HERE</div>
      <svg className="hero-glass" viewBox="0 0 260 300" fill="none">
        <defs>
          <linearGradient id="drinkFill" x1="63" y1="67" x2="197" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB56F" />
            <stop offset="1" stopColor="#EF6845" />
          </linearGradient>
          <linearGradient id="glassFill" x1="77" y1="93" x2="189" y2="245" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF" stopOpacity=".82" />
            <stop offset="1" stopColor="#FFF" stopOpacity=".18" />
          </linearGradient>
        </defs>
        <path d="m57 47 147 7-48 108-22 61 49 18H76l50-18-21-61L57 47Z" fill="url(#drinkFill)" />
        <path d="m48 38 164 8-52 116-24 62 50 18H71l53-18-22-62L48 38Z" stroke="url(#glassFill)" strokeWidth="5" strokeLinejoin="round" />
        <path d="m58 60 145 7" stroke="#FFF" strokeOpacity=".78" strokeWidth="4" strokeLinecap="round" />
        <path d="M108 63c13 13 31 16 54 9" stroke="#FFF7E9" strokeWidth="8" strokeLinecap="round" />
        <circle cx="174" cy="62" r="20" fill="#DDF05F" />
        <circle cx="174" cy="62" r="12" stroke="#FFF9D8" strokeWidth="2" />
        <path d="m174 50 1 24m12-12h-24m19-9-17 17m0-17 17 17" stroke="#FFF9D8" strokeWidth="1.5" />
        <path d="m140 25 56-18" stroke="#34453D" strokeWidth="5" strokeLinecap="round" />
        <path d="M125 100c-4 14 1 24 13 30" stroke="#FFE2B6" strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="art-spark spark-a">✳</span>
      <span className="art-spark spark-b">✦</span>
      <span className="art-dot" />
    </div>
  );
}

function CocktailCard({ drink, index, onOpen, isLoading }) {
  const category = drink.category || 'Коктейль';

  return (
    <button
      className={`cocktail-card${isLoading ? ' is-loading' : ''}`}
      type="button"
      onClick={() => onOpen(drink)}
      disabled={isLoading}
      aria-label={`Открыть рецепт: ${drink.name}`}
    >
      <div className="cocktail-photo">
        {drink.image && (
          <img
            src={drink.image}
            alt={drink.name}
            loading={index > 2 ? 'lazy' : 'eager'}
            onError={(event) => event.currentTarget.parentElement?.classList.add('has-no-image')}
          />
        )}
        <div className="photo-placeholder" aria-hidden="true"><span>✳</span></div>
        <span className="photo-category">{category}</span>
        <span className="card-open-icon"><ArrowIcon diagonal /></span>
        {isLoading && <span className="card-loading-label">Загружаем рецепт…</span>}
      </div>
      <div className="cocktail-card-copy">
        <div>
          <span className="card-eyebrow">COCKTAIL № {String(index + 1).padStart(2, '0')}</span>
          <h3>{drink.name}</h3>
        </div>
        <span className="card-arrow" aria-hidden="true"><ArrowIcon /></span>
      </div>
    </button>
  );
}

function LoadingCards() {
  return (
    <div className="cocktail-grid" aria-label="Загружаем коктейли">
      {[0, 1, 2].map((item) => (
        <div className="skeleton-card" key={item}>
          <div className="skeleton-photo shimmer" />
          <div className="skeleton-line shimmer" />
          <div className="skeleton-line short shimmer" />
        </div>
      ))}
    </div>
  );
}

function CocktailDetails({ drink, onClose }) {
  const instructions = drink.instructions.trim();
  const alcoholLabel = drink.alcoholic.toLowerCase() === 'alcoholic'
    ? 'С алкоголем'
    : drink.alcoholic.toLowerCase() === 'non alcoholic'
      ? 'Без алкоголя'
      : drink.alcoholic || 'Тип не указан';

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть окно">
          <span />
          <span />
        </button>
        <div className="detail-photo">
          {drink.image && (
            <img
              src={drink.image}
              alt={drink.name}
              onError={(event) => event.currentTarget.parentElement?.classList.add('has-no-image')}
            />
          )}
          <div className="photo-placeholder" aria-hidden="true"><span>✳</span></div>
          <div className="detail-photo-caption"><span>THE COCKTAIL FILES</span><span>№ {drink.id}</span></div>
        </div>
        <div className="detail-content">
          <div className="detail-topline">
            <span className="detail-category">{drink.category || 'Классический рецепт'}</span>
            <span className="detail-alcohol"><i />{alcoholLabel}</span>
          </div>
          <h2 id="detail-title">{drink.name}</h2>
          {drink.glass && <p className="glass-note">Подача: <strong>{drink.glass}</strong></p>}

          <div className="detail-divider" />
          <div className="detail-section-heading">
            <h3>Что понадобится</h3>
            <span>{drink.ingredients.length} ингредиента</span>
          </div>
          {drink.ingredients.length > 0 ? (
            <ul className="ingredient-list">
              {drink.ingredients.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <span>{item.name}</span>
                  <span>{item.measure || 'по вкусу'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-muted">Состав для этого рецепта не указан.</p>
          )}

          <div className="instructions-block">
            <div className="detail-section-heading"><h3>Как приготовить</h3><span>ПОШАГОВО</span></div>
            {instructions ? (
              <p className="instructions-copy">{instructions}</p>
            ) : (
              <p className="detail-muted">Инструкция пока не добавлена.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('name');
  const [query, setQuery] = useState('');
  const [drinks, setDrinks] = useState([]);
  const [busy, setBusy] = useState('');
  const [loadingCardId, setLoadingCardId] = useState('');
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [error, setError] = useState('');
  const [prankOpen, setPrankOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('Коктейль для вдохновения');
  const [resultDescription, setResultDescription] = useState('Случайная находка из TheCocktailDB — нажмите на карточку, чтобы открыть рецепт.');
  const initialRequestStarted = useRef(false);

  async function loadRandomCocktail() {
    setBusy('random');
    setError('');
    setSelectedDrink(null);
    try {
      const response = await fetchCocktailApi('random.php');
      const cocktail = normalizeCocktail(response.drinks?.[0]);
      if (!cocktail) throw new Error('В ответе API нет коктейля.');
      setDrinks([cocktail]);
      setResultTitle('Коктейль для вдохновения');
      setResultDescription('Случайная находка из TheCocktailDB — нажмите на карточку, чтобы открыть рецепт.');
    } catch {
      setDrinks([]);
      setResultTitle('Не удалось загрузить коктейль');
      setResultDescription('Проверьте подключение к интернету и попробуйте ещё раз.');
      setError('TheCocktailDB не ответил. Проверьте интернет-соединение или повторите запрос чуть позже.');
    } finally {
      setBusy('');
    }
  }

  useEffect(() => {
    // React StrictMode повторно запускает эффекты в режиме разработки; не делаем два стартовых запроса.
    if (initialRequestStarted.current) return;
    initialRequestStarted.current = true;
    loadRandomCocktail();
  }, []);

  useEffect(() => {
    if (!prankOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPrankOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prankOpen]);

  useEffect(() => {
    if (!selectedDrink) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedDrink(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDrink]);

  async function handleSearch(event, forcedMode, forcedQuery) {
    event?.preventDefault();
    const searchMode = forcedMode || mode;
    const searchQuery = (forcedQuery ?? query).trim();

    if (!searchQuery) {
      setError(searchMode === 'name' ? 'Введите название коктейля для поиска.' : 'Введите ингредиент для поиска.');
      return;
    }

    setMode(searchMode);
    setQuery(searchQuery);
    setBusy('search');
    setError('');
    setSelectedDrink(null);

    const endpoint = searchMode === 'name' ? 'search.php?s=' : 'filter.php?i=';
    try {
      const response = await fetchCocktailApi(`${endpoint}${encodeURIComponent(searchQuery)}`);
      const foundDrinks = (response.drinks || []).map(normalizeCocktail).filter(Boolean);
      setDrinks(foundDrinks);
      if (foundDrinks.length > 0) {
        setResultTitle(searchMode === 'name' ? 'Результаты поиска' : `С ${searchQuery} в составе`);
        setResultDescription(`Нашли ${foundDrinks.length} ${pluralizeCocktails(foundDrinks.length)}. Выберите карточку, чтобы посмотреть состав и инструкцию.`);
      } else {
        setResultTitle('Ничего не нашлось');
        setResultDescription('Попробуйте другое название или ингредиент на английском языке.');
      }
    } catch {
      setDrinks([]);
      setResultTitle('Не удалось выполнить поиск');
      setResultDescription('Проверьте подключение к интернету и повторите запрос.');
      setError('Не получилось связаться с TheCocktailDB. Попробуйте ещё раз.');
    } finally {
      setBusy('');
    }
  }

  async function openCocktail(drink) {
    // filter.php возвращает только краткую карточку, поэтому для неё отдельно загружаем lookup.php.
    if (drink.ingredients.length > 0) {
      setSelectedDrink(drink);
      return;
    }

    setLoadingCardId(drink.id);
    setError('');
    try {
      const response = await fetchCocktailApi(`lookup.php?i=${encodeURIComponent(drink.id)}`);
      const fullCocktail = normalizeCocktail(response.drinks?.[0]);
      if (!fullCocktail) throw new Error('Рецепт не найден.');
      setSelectedDrink(fullCocktail);
    } catch {
      setError(`Не удалось загрузить рецепт «${drink.name}». Попробуйте открыть карточку ещё раз.`);
    } finally {
      setLoadingCardId('');
    }
  }

  const isBusy = busy !== '';

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Mixly — на главную">
          <CocktailMark />
          <span>mixly<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-center"><span className="status-dot" />УЧЕБНЫЙ ПРОЕКТ · THECOCKTAILDB API</div>
        <div className="topbar-actions">
          <button className="random-button top-random" type="button" onClick={loadRandomCocktail} disabled={isBusy}>
            <span className="random-star">✳</span>
            {busy === 'random' ? 'Ищем коктейль…' : 'Случайный коктейль'}
            <ArrowIcon diagonal />
          </button>
          <button className="register-button" type="button" onClick={() => setPrankOpen(true)}>
            Зарегистрироваться
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" />ПОРА СМЕШАТЬ ЧТО-ТО НОВОЕ</div>
            <h1>Найди свой<br /><em>коктейль.</em></h1>
            <p>Ищи по названию или тому, что уже есть под рукой. А мы найдём рецепт, состав и способ приготовления.</p>
            <div className="hero-points">
              <span><i>01</i> поиск по API</span>
              <span><i>02</i> готовые рецепты</span>
            </div>
          </div>
          <HeroIllustration />
        </section>

        <section className="search-panel" aria-label="Поиск коктейлей">
          <div className="search-panel-top">
            <div>
              <span className="panel-label">С ЧЕГО НАЧНЁМ?</span>
              <h2>Собери свою подборку</h2>
            </div>
            <div className="search-modes" role="tablist" aria-label="Тип поиска">
              <button type="button" role="tab" aria-selected={mode === 'name'} className={mode === 'name' ? 'active' : ''} onClick={() => { setMode('name'); setError(''); }}>
                По названию
              </button>
              <button type="button" role="tab" aria-selected={mode === 'ingredient'} className={mode === 'ingredient' ? 'active' : ''} onClick={() => { setMode('ingredient'); setError(''); }}>
                По ингредиенту
              </button>
            </div>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <label className="search-input-wrap">
              <span className="search-input-icon"><SearchIcon /></span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={mode === 'name' ? 'Например, margarita' : 'Например, vodka'}
                aria-label={mode === 'name' ? 'Название коктейля' : 'Ингредиент'}
              />
              <span className="input-hint">ИЩЕМ НА АНГЛИЙСКОМ</span>
            </label>
            <button className="search-submit" type="submit" disabled={isBusy}>
              {busy === 'search' ? 'Ищем…' : <>Найти коктейли <ArrowIcon /></>}
            </button>
          </form>
          <div className="quick-searches">
            <span>ПОПУЛЯРНЫЕ ИНГРЕДИЕНТЫ</span>
            {QUICK_INGREDIENTS.map((ingredient) => (
              <button
                type="button"
                key={ingredient}
                disabled={isBusy}
                onClick={() => handleSearch(undefined, 'ingredient', ingredient)}
              >
                {ingredient}<span>↗</span>
              </button>
            ))}
          </div>
          <p className="search-note">TheCocktailDB хранит названия и ингредиенты на английском — так результаты будут точнее.</p>
        </section>

        <section className="results-section" aria-live="polite">
          <div className="results-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-line" />ВАША ПОДБОРКА</span>
              <h2>{resultTitle}</h2>
              <p>{resultDescription}</p>
            </div>
            <span className="result-count">{drinks.length} <span>{pluralizeCocktails(drinks.length)}</span></span>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-mark">!</span>
              <span>{error}</span>
              {drinks.length === 0 && <button type="button" onClick={loadRandomCocktail}>Попробовать случайный поиск <ArrowIcon /></button>}
            </div>
          )}

          {isBusy ? <LoadingCards /> : drinks.length > 0 ? (
            <div className="cocktail-grid">
              {drinks.map((drink, index) => (
                <CocktailCard
                  key={drink.id}
                  drink={drink}
                  index={index}
                  onOpen={openCocktail}
                  isLoading={loadingCardId === drink.id}
                />
              ))}
            </div>
          ) : !error ? (
            <div className="empty-state">
              <div className="empty-graphic"><SearchIcon /></div>
              <h3>Пока пусто — и это легко исправить</h3>
              <p>Измените запрос или нажмите на случайный выбор, чтобы открыть новый рецепт.</p>
              <button type="button" className="empty-random" onClick={loadRandomCocktail} disabled={isBusy}>Показать случайный коктейль <ArrowIcon /></button>
            </div>
          ) : null}
        </section>

        <section className="api-section" aria-labelledby="api-title">
          <div className="api-intro">
            <span className="eyebrow"><span className="eyebrow-line" />ЧТО ПОД КАПОТОМ</span>
            <h2 id="api-title">Несколько запросов.<br /><em>Много вариантов.</em></h2>
            <p>Интерфейс получает реальные данные из TheCocktailDB и приводит их к удобному для показа формату.</p>
          </div>
          <div className="endpoint-list">
            <div className="endpoint-row"><span className="endpoint-number">01</span><code>search.php?s=margarita</code><span>ПОИСК ПО НАЗВАНИЮ</span></div>
            <div className="endpoint-row"><span className="endpoint-number">02</span><code>filter.php?i=vodka</code><span>ФИЛЬТР ПО ИНГРЕДИЕНТУ</span></div>
            <div className="endpoint-row"><span className="endpoint-number">03</span><code>lookup.php?i=11007</code><span>ПОЛНЫЙ РЕЦЕПТ</span></div>
            <div className="endpoint-row"><span className="endpoint-number">04</span><code>random.php</code><span>СЛУЧАЙНЫЙ КОКТЕЙЛЬ</span></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#top"><CocktailMark /><span>mixly<span className="brand-dot">.</span></span></a>
        <span>React · TheCocktailDB API · учебный проект</span>
        <a href="https://www.thecocktaildb.com/api.php" target="_blank" rel="noreferrer">Документация API <ArrowIcon diagonal /></a>
      </footer>

      {prankOpen && <PrankVideo onClose={() => setPrankOpen(false)} />}
      {selectedDrink && <CocktailDetails drink={selectedDrink} onClose={() => setSelectedDrink(null)} />}
    </div>
  );
}

// Шуточное окно «регистрации»: видео лежит в public/gosling2.mp4
function PrankVideo({ onClose }) {
  const [videoMissing, setVideoMissing] = useState(false);

  return (
    <div className="prank-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Регистрация">
      <div className="prank-window" onClick={(event) => event.stopPropagation()}>
        <button className="prank-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        {videoMissing ? (
          <div className="prank-fallback">
            <strong>404</strong>
            <p>Регистрация не найдена. Положите файл <code>gosling2.mp4</code> в папку <code>public</code>.</p>
          </div>
        ) : (
          <video src="/gosling2.mp4" autoPlay controls playsInline onEnded={onClose} onError={() => setVideoMissing(true)} />
        )}
      </div>
    </div>
  );
}

export default App;
