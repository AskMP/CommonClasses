import EventEmitter from './EventEmitter.js';

export class NFCTap extends EventEmitter {

    constructor(config = {}) {
        super();

        config = Object.assign({
            timeout : 2000
        }, config);

        // Last tap is really the only thing that is available to
        // the primary code as an external property. It will contain
        // the event information of the previous tap only and will
        // be overridden upon a subsequent tap.
        this.lastTap;

        if (!window.NFCReader) return;
        
        // We want to ensure that the reader is localized to the object
        let reader = new NFCReader();

        /***
         * We listen for any reading event that the NFC comes back with.
         * I'm avoiding any writing as of yet as there is still far too much
         * in the unknown for how the final implementation will be done.
         * This will be added later however it's only reading right now.
         */
        reader.addEventListener('reading', evt => {

            // We don't want to duplicate and constantly bombard events
            if (evt.serialNumber === this.lastTap.serialNumber) return;
            
            // Even with the above stopping multitudes of events, there is still a strong use case for repeatedly scanning the same tag
            if (!!config.timeout) setTimeout(() => this.lastTap = false, config.timeout);

            // Once captured, we want to save the tap and emit the serial number as to use that in our code
            this.lastTap = evt;
            this.emit('tap', this.lastTap.serialNumber);

            // As tags can have multiple records, we emit a new record event for each. The record type can be then captured
            // and processed by the listener. There are 2 events here, a "records" which emits an array of all elements
            // and a "record" for each.
            if (!this.lastTap.message || !this.lastTap.message.records) return;
            this.emit('records', this.lastTap.message.records);
            this.lastTap.message.records.forEach(record => this.emit('record', record));
        });
        // As of 09-2019, there is an update to the specification that uses "scan()" and not "start()" as the instigation
        if (!!reader.scan) reader.scan();
        if (!!reader.start) reader.start();
    }

}

export { NFCTap as default };