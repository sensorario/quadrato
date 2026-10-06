import { toPlainText } from '../src/utils/toPlainText';

describe('toPlainText', () => {
    it('keeps plain text, spaces and line breaks untouched', () => {
        expect(toPlainText('prima riga\n\n  seconda   riga')).toBe('prima riga\n\n  seconda   riga');
    });

    it('removes html tags but keeps the text inside them', () => {
        expect(toPlainText('<p>ciao <b>mondo</b></p>')).toBe('ciao mondo');
    });

    it('removes script and style blocks together with their content', () => {
        expect(toPlainText('a<script>alert(1)</script>b<STYLE>p{}</STYLE>c')).toBe('abc');
    });

    it('removes tags carrying javascript in their attributes', () => {
        expect(toPlainText('<img src=x onerror="alert(1)">testo')).toBe('testo');
    });

    it('keeps a lone less-than sign that is not a tag', () => {
        expect(toPlainText('3 < 5')).toBe('3 < 5');
    });
});
