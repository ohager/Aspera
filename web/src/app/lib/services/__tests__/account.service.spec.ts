import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

import {StoreService} from '../store.service';
import {testConfigFactory} from '../../config/store.config';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Settings} from '../../model';
import {AccountService} from '../account.service';
import {CryptoService} from '../crypto.service';
import {DICTIONARY} from '../../util/crypto/passPhraseGenerator/dictionary';
import TestDictionary from '../../util/crypto/passPhraseGenerator/testDictionary';

describe('AccountService', () => {

    beforeEach(() => {

        const storeServiceMock = new StoreService(testConfigFactory());
        storeServiceMock.settings = new BehaviorSubject(new Settings());

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {provide: DICTIONARY, useValue: new TestDictionary()},
                CryptoService,
                AccountService,
                {provide: StoreService, useValue: storeServiceMock}
            ]
        });
    });

    it('should be created', inject([AccountService], (service: AccountService) => {
            expect(service).not.toBeNull();
        })
    );
});
