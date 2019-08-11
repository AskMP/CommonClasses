const FIELDS = [
    { name: 'ADR',          attribute: 'address',       match: /(ADR;?)(TYPE=[\w|\s|\d]*)?/i,   process: data => data.split(';').map(d => d.trim()).filter(d => d !== '') },
    { name: 'ANNIVERSARY',  attribute: 'anniversary',   match: /(ANNIVERSARY)/i,                process: data => [data.substr(0, 4), data.substr(3, 2), data.substr(5, 2)].join('-') },
    { name: 'BDAY',         attribute: 'birthday',      match: /(BDAY)/i,                       process: data => [data.substr(0, 4), data.substr(3, 2), data.substr(5, 2)].join('-') },
    { name: 'CATEGORIES',   attribute: 'categories',    match: /(CATEGORIES)/i,                 process: data => data.split(',').map(d => d.trim()).filter(d => d !== '') },
    { name: 'EMAIL',        attribute: 'email',         match: /(EMAIL)/i,                      process: data => data.trim() },
    { name: 'FN',           attribute: 'fullname',      match: /(FN)/i,                         process: data => data.trim() },
    { name: 'GENDER',       attribute: 'gender',        match: /(GENDER)/i,                     process: data => data.trim() },
    { name: 'GEO',          attribute: 'geographical',  match: /(GEO)/i,                        process: data => data.replace(/(geo\:)/gi, '').replace(';', ',').split(',').map(d => parseFloat(d)) },
    { name: 'LANG',         attribute: 'language',      match: /(LANG)/i,                       process: data => data.trim() },
    { name: 'N',            attribute: 'name',          match: /(N)/i,                          process: data => Object.fromEntries(data.split(';').map((d, i) => { switch (i) { case 0: return ["family", d]; case 1: return ["given", d]; case 2: return ["middle", d]; case 3: return ["suffix", d]; }}))},
    { name: 'NOTE',         attribute: 'notes',         match: /(NOTES)/i,                      process: data => data.trim().replace(/\\n/, "\r\n") },
    { name: 'ORG',          attribute: 'organizations', match: /(ORG)/i,                        process: data => data.split(';') },
    { name: 'ROLE',         attribute: 'role',          match: /(ROLE)/i,                       process: data => data.trim() },
    { name: 'TEL',          attribute: 'phone',         match: /(TEL;?)(TYPE=[\w|\s|\d]*)?/i,   process: data => parseInt(data.replace(/\D/gi, ''), 10) },
    { name: 'TITLE',        attribute: 'title',         match: /(TITLE)/i,                      process: data => data.trim() },
    { name: 'TZ',           attribute: 'timezone',      match: /(TZ)/i,                         process: data => data.trim() },
    { name: 'URL',          attribute: 'website',       match: /(URL)/i,                        process: data => data.trim() }
];

export class VCard {

    constructor(raw = false) {
        if (raw) this.parse(raw);
    }

    parse(raw = "") {
        if (raw.constructor.name === 'ArrayBuffer') raw = String.fromCharCode.apply(null, new Uint8Array(raw));
        if (raw.constructor.name !== 'String') throw new Error(`Invalid data type to parse. Must be a string`);
        this.raw = raw;
        raw = raw.split('\n');
        raw.forEach(line => {
            line = line.split(':');
            let attr = line.shift();
            line = line.join(':');
            FIELDS.forEach(field => {
                if (attr.search(field.match) !== 0 || field.name.length === 1 && attr.length !== 1) return;
                if (this[field.attribute] && this[field.attribute].constructor.name !== 'Array') this[field.attribute] = [this[field.attribute]].concat(field.process(line));
                else this[field.attribute] = field.process(line);
            });
        });
        if (this.fullname) {
            let n = this.fullname.split(' ');
            this.name = {
                given : n[0],
                family: (n.length > 2) ? n[2] : n[1],
                middle: (n.length > 2) ? n[1] : undefined
            };
        } else if (this.fullname === '' && !!this.name) {
            this.fullname = `${name.given} ${name.middle} ${name.family}`.trim().replace(/\s\s/gi, ' ');
        }
        return this;
    }

}

export { VCard as default };