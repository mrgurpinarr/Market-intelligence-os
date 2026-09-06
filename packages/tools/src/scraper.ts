import axios from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import type { AgentTool } from '@market-intel/core';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * DuckDuckGo Search Engine Integration
 */
export async function searchDuckDuckGo(query: string, maxResults = 5): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $('.result').each((i, el) => {
      if (results.length >= maxResults) return false;

      const titleEl = $(el).find('.result__title .result__a');
      const snippetEl = $(el).find('.result__snippet');

      const title = titleEl.text().trim();
      let link = titleEl.attr('href') || '';
      const snippet = snippetEl.text().trim();

      if (link.includes('uddg=')) {
        const match = link.match(/uddg=([^&]+)/);
        if (match && match[1]) {
          link = decodeURIComponent(match[1]);
        }
      }

      if (title && link && snippet) {
        results.push({ title, url: link, snippet });
      }
    });

    return results;
  } catch (error) {
    console.error(`Web search error (${query}):`, (error as Error).message);
    return [];
  }
}

/**
 * Clean Web Page Content Extractor
 */
export async function extractWebContent(url: string): Promise<{ title: string; text: string }> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    $('script, style, noscript, nav, footer, header, svg, form, iframe').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || 'No Title';
    
    const text = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 15000);

    return { title, text };
  } catch (error) {
    return {
      title: 'Error',
      text: `Content extraction failed (${url}): ${(error as Error).message}`,
    };
  }
}

/**
 * Agent Web Search Tool
 */
export const searchWebTool: AgentTool<{ query: string; maxResults?: number }, SearchResult[]> = {
  name: 'search_web',
  description: 'Searches the web in real-time for live market intelligence, competitor moves, and current data.',
  schema: z.object({
    query: z.string().describe('Keywords or research question to search for'),
    maxResults: z.number().optional().describe('Maximum number of results to return (default: 5)'),
  }),
  execute: async ({ query, maxResults = 5 }) => {
    return await searchDuckDuckGo(query, maxResults);
  },
};

/**
 * Agent Web Content Scraper Tool
 */
export const extractPageContentTool: AgentTool<{ url: string }, { title: string; text: string }> = {
  name: 'extract_page_content',
  description: 'Fetches and parses clean textual content and title from a given web URL.',
  schema: z.object({
    url: z.string().describe('Valid web page URL to extract text from'),
  }),
  execute: async ({ url }) => {
    return await extractWebContent(url);
  },
};
