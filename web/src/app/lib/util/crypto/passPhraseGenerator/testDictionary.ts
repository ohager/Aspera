/**
 * Reduced Dictionary for test purposes only
 * @see FullDictionary
 */
import Dictionary from './dictionary';
import {Injectable} from '@angular/core';

@Injectable()
export default class TestDictionary implements Dictionary {
    private static words: string[] = null;

    public getWords(): string[] {

        if (!TestDictionary.words) {
            // significantly reduced dictionary to save time and memory...this is for test purposes only
            TestDictionary.words = ['about', 'search', 'other', 'which', 'their', 'there', 'contact', 'business', 'online', 'first', 'would', 'services', 'these', 'click', 'service', 'price', 'people', 'state', 'email', 'health', 'world', 'products', 'music', 'should', 'product', 'system', 'policy', 'number', 'please', 'support', 'message', 'after', 'software', 'video', 'where', 'rights', 'public', 'books', 'school', 'through', 'links', 'review', 'years', 'order', 'privacy', 'items', 'company', 'group', 'under', 'general', 'research', 'january', 'reviews', 'program', 'games', 'could', 'great', 'united', 'hotel', 'center', 'store', 'travel', 'comments', 'report', 'member', 'details', 'terms', 'before', 'hotels', 'right', 'because', 'local', 'those', 'using', 'results', 'office', 'national', 'design', 'posted', 'internet', 'address', 'within', 'states', 'phone', 'shipping', 'reserved', 'subject', 'between', 'forum', 'family', 'based', 'black', 'check', 'special', 'prices', 'website', 'index', 'being', 'women', 'today', 'south', 'project', 'pages', 'version', 'section', 'found', 'sports', 'house', 'related', 'security', 'county', 'american', 'photo', 'members', 'power', 'while', 'network', 'computer', 'systems', 'three', 'total', 'place', 'download', 'without', 'access', 'think', 'morrison', 'maiden', 'examines', 'viking', 'myrtle', 'bored', 'cleanup', 'bother', 'budapest', 'knitting', 'attacked', 'bhutan', 'mating', 'compute', 'redhead', 'arrives', 'tractor', 'allah', 'unwrap', 'fares', 'resist', 'hoped', 'safer', 'wagner', 'touched', 'cologne', 'wishing', 'ranger', 'smallest', 'newman', 'marsh', 'ricky', 'scared', 'theta', 'monsters', 'asylum', 'lightbox', 'robbie', 'stake', 'cocktail', 'outlets', 'arbor', 'poison'];
        }

        return TestDictionary.words;
    }
}
