import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {BurstService} from '../burst.service';
import {I18nService} from '../../i18n/i18n.service';
import {StoreService} from '../store.service';
import {testConfigFactory} from '../../config/store.config';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {BlockChainStatus, HttpError, Settings} from '../../model';


jest.mock('../../i18n/i18n.service');

describe('BurstService', () => {
    let httpMock: HttpTestingController;
    const settings: Settings = new Settings();

    beforeEach(() => {

        const storeServiceMock = new StoreService(testConfigFactory());
        storeServiceMock.settings = new BehaviorSubject(settings);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                BurstService,
                I18nService,
                {provide: StoreService, useValue: storeServiceMock}
            ]
        });

        httpMock = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });


    it('should be created', inject([BurstService], (service: BurstService) => {
            expect(service).not.toBeNull();
        })
    );

    describe('getBlockchainStatus', () => {
        it('should return a valid status', (done) => {
                inject([BurstService], (service: BurstService) => {
                    service.getBlockchainStatus().subscribe( response => {
                        // @ts-ignore
                        expect(response.lastBlock).toBe('123');
                        done();
                    });

                    const request =  httpMock.expectOne(`${settings.node}?requestType=getBlockchainStatus`);

                    const mockedStatus = new BlockChainStatus();
                    mockedStatus.lastBlock = '123';
                    request.flush(mockedStatus);

                }).call(null);
            }
        );

        it('should return an error', (done) => {
                inject([BurstService], (service: BurstService) => {
                    // @ts-ignore
                    service.getBlockchainStatus().subscribe( ({status, message}) => {
                        expect(status).toBe(500);
                        expect(message).toBe('some test error');
                        done();
                    });
                    const request =  httpMock.expectOne(`${settings.node}?requestType=getBlockchainStatus`);
                    request.flush(new HttpError({status: 500, message: 'some test error'}));

                }).call(null);
            }
        )
    });
});
