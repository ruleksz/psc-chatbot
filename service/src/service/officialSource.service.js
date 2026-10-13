const OFFICIAL_DOMAINS = [
    "valorantesports.com",
    "lolesports.com",
    "esportsworldcup.com",
    "pubgesports.com",
    "pubgmobile.com",
    "dota2.com",
    "counter-strike.net",
    "callofdutyleague.com",
    "overwatchleague.com",
    "esports.mpl.id",
    "mplindonesia.com",
    "mobilelegends.com",
    "moonton.com",
    "ea.com",
    "rocketleagueesports.com",
    "fortnite.com",
    "halowaypoint.com",
    "playvalorant.com",
    "riotgames.com",
    "blizzard.com",
    "ubisoft.com",
    "freefireesports.com",
    "apexlegendsstatus.com",
];

const TRUSTED_DOMAINS = [
    "liquipedia.net",
    "hltv.org",
    "vlr.gg",
    "thespike.gg",
    "op.gg",
    "bo3.gg",
    "gosugamers.net",
    "esports.gg",
    "dotesports.com",
    "dexerto.com",
    "oneesports.gg",
    "afkgaming.com",
    "escorenews.com",
    "revivaltv.id",
    "ggwp.id",
    "dailyspin.id",
    "skor.id",
    "kincir.com",
    "hybrid.co.id",
    "upstation.asia",
    "esports.id",
    "spin.ph",
    "dust2.us",
    "rushbmedia.com",
    "siege.gg",
    "raidiant.gg",
];

const BLOCKED_DOMAINS = [
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "x.com",
    "twitter.com",
    "youtube.com",
    "reddit.com",
    "pinterest.com",
];

const DEFAULT_MAX_RESULTS = 8;
const MAX_CONTENT_CHARS = 4000;
const MAX_SEARCH_VARIANTS = 4;

function normalizeHostname(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
        return "";
    }
}

function matchesDomain(hostname, domain) {
    return hostname === domain || hostname.endsWith(`.${domain}`);
}

function isBlockedUrl(url) {
    const hostname = normalizeHostname(url);
    return BLOCKED_DOMAINS.some((domain) => matchesDomain(hostname, domain));
}

function sourceType(url) {
    const hostname = normalizeHostname(url);

    if (OFFICIAL_DOMAINS.some((domain) => matchesDomain(hostname, domain))) {
        return "official";
    }

    if (TRUSTED_DOMAINS.some((domain) => matchesDomain(hostname, domain))) {
        return "trusted";
    }

    return "web";
}

function trimContent(content) {
    return String(content || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_CONTENT_CHARS);
}

function sourcePublisher(url) {
    const hostname = normalizeHostname(url);
    const domain = [...OFFICIAL_DOMAINS, ...TRUSTED_DOMAINS].find((allowedDomain) =>
        matchesDomain(hostname, allowedDomain)
    );

    return domain || hostname || "Web source";
}

function sourcePriority(source) {
    if (source.sourceType === "official") return 0;
    if (source.sourceType === "trusted") return 1;
    return 2;
}

function normalizeQueryText(query) {
    return String(query || "")
        .normalize("NFKC")
        .replace(/\s+/g, " ")
        .trim();
}

function buildSearchQueries(query) {
    const normalizedQuery = normalizeQueryText(query);
    const lowerQuery = normalizedQuery.toLowerCase();
    const queries = new Set([
        normalizedQuery,
        `${normalizedQuery} esports`,
        `${normalizedQuery} schedule results standings roster`,
        `${normalizedQuery} tournament standings results`,
    ]);

    if (/\bmpl\b/.test(lowerQuery) || /mobile\s+legends|mlbb/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} MPL Mobile Legends playoff regular season`);
        queries.add(`${normalizedQuery} MPL Indonesia klasemen playoff`);
        queries.add(`${normalizedQuery} MPL ID season 17 tidak lolos playoff`);
        queries.add(`${normalizedQuery} Mobile Legends Professional League standings`);
    }

    if (/valorant|\bvct\b|valorant\s+champions/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} Valorant Champions Tour standings schedule results`);
        queries.add(`${normalizedQuery} VCT playoffs qualification teams`);
    }

    if (/league\s+of\s+legends|\blol\b|\blck\b|\blec\b|\blcs\b|\blpl\b|worlds\b|msi\b/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} League of Legends esports standings schedule results`);
        queries.add(`${normalizedQuery} LoL Esports playoffs qualification teams`);
    }

    if (/dota\s*2|the\s+international|\bti\d*\b|dpc\b/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} Dota 2 tournament standings results playoff`);
        queries.add(`${normalizedQuery} Dota 2 teams eliminated qualified`);
    }

    if (/cs2|counter[\s-]?strike|blast|iem|pgl|esl\s+pro\s+league/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} CS2 standings results playoff teams`);
        queries.add(`${normalizedQuery} Counter-Strike tournament teams eliminated qualified`);
    }

    if (/pubg|pmgc|pmsl|pubg\s+mobile/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} PUBG esports standings results qualification`);
        queries.add(`${normalizedQuery} PUBG Mobile esports playoff qualified teams`);
    }

    if (/free\s*fire|ffws|ffml/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} Free Fire esports standings results playoff`);
        queries.add(`${normalizedQuery} FFWS FFML teams qualified eliminated`);
    }

    if (/call\s+of\s+duty|\bcdl\b|cod\s+league/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} Call of Duty League standings schedule results`);
        queries.add(`${normalizedQuery} CDL playoffs teams qualified eliminated`);
    }

    if (/overwatch|\bowl\b|owcs/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} Overwatch esports standings schedule results`);
        queries.add(`${normalizedQuery} OWCS teams qualified eliminated playoff`);
    }

    if (/rocket\s+league|\brlcs\b/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} RLCS standings results playoff teams`);
        queries.add(`${normalizedQuery} Rocket League esports qualification eliminated`);
    }

    if (/fortnite|fncs/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} Fortnite FNCS standings results winners`);
        queries.add(`${normalizedQuery} Fortnite esports qualification teams players`);
    }

    if (/apex\s+legends|\balgs\b/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} ALGS standings results playoff teams`);
        queries.add(`${normalizedQuery} Apex Legends esports qualification eliminated`);
    }

    if (/rainbow\s+six|r6|six\s+invitational/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} Rainbow Six esports standings results playoff`);
        queries.add(`${normalizedQuery} R6 teams qualified eliminated`);
    }

    if (/tidak\s+lolos|gagal\s+lolos|not\s+qualif|eliminated/.test(lowerQuery)) {
        queries.add(`${normalizedQuery} eliminated teams`);
        queries.add(`${normalizedQuery} failed to qualify playoff`);
    }

    return [...queries]
        .filter(Boolean)
        .slice(0, MAX_SEARCH_VARIANTS);
}

async function searchWithTavily(query, maxResults) {
    const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
            query,
            search_depth: "advanced",
            max_results: Math.min(Math.max(maxResults, 1), 10),
            include_raw_content: "text",
            include_answer: false,
            include_images: false,
            include_favicon: true,
            exclude_domains: BLOCKED_DOMAINS,
            topic: "general",
        }),
    });

    if (!response.ok) {
        const error = new Error(`Tavily search gagal dengan status ${response.status}.`);
        error.code = "OFFICIAL_SOURCE_SEARCH_ERROR";
        throw error;
    }

    const payload = await response.json();
    return Array.isArray(payload.results) ? payload.results : [];
}

export function hasOfficialSourceSearchKey() {
    return Boolean(process.env.TAVILY_API_KEY);
}

export async function findOfficialSources(query) {
    if (!hasOfficialSourceSearchKey()) {
        return [];
    }

    const maxResults = Number(process.env.OFFICIAL_SOURCE_MAX_RESULTS) || DEFAULT_MAX_RESULTS;
    const searchQueries = buildSearchQueries(query);
    const resultMap = new Map();

    for (const searchQuery of searchQueries) {
        const results = await searchWithTavily(searchQuery, maxResults);

        for (const result of results) {
            if (!result?.url || isBlockedUrl(result.url)) {
                continue;
            }

            const canonicalUrl = result.url.split("#")[0];
            const existing = resultMap.get(canonicalUrl);
            const score = typeof result.score === "number" ? result.score : 0;

            if (!existing || score > (existing.score || 0)) {
                resultMap.set(canonicalUrl, {
                    ...result,
                    url: canonicalUrl,
                    score,
                });
            }
        }
    }

    return [...resultMap.values()]
        .map((result) => ({
            title: String(result.title || sourcePublisher(result.url)).trim(),
            url: result.url,
            publisher: sourcePublisher(result.url),
            sourceType: sourceType(result.url),
            content: trimContent(result.raw_content || result.content),
            score: typeof result.score === "number" ? result.score : null,
        }))
        .filter((source) => source.content.length > 80)
        .sort((a, b) => {
            const priorityDifference = sourcePriority(a) - sourcePriority(b);
            if (priorityDifference !== 0) return priorityDifference;
            return (b.score || 0) - (a.score || 0);
        })
        .slice(0, maxResults);
}

export function buildOfficialSourceContext(sources) {
    return sources
        .map((source, index) => {
            return [
                `[${index + 1}] ${source.title}`,
                `Publisher: ${source.publisher}`,
                `Jenis sumber: ${source.sourceType}`,
                `URL: ${source.url}`,
                `Konten: ${source.content}`,
            ].join("\n");
        })
        .join("\n\n");
}

export function serializeSources(sources) {
    return sources.map((source, index) => ({
        id: index + 1,
        title: source.title,
        url: source.url,
        publisher: source.publisher,
        sourceType: source.sourceType,
    }));
}
