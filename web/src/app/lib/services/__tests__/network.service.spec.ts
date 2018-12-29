import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {NetworkService} from '../network.service';
import {BurstNode} from '../../model';

describe('NetworkService', () => {

    let burstNode: BurstNode;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        burstNode = new BurstNode();
        burstNode.address = 'https://node.burst.com';
        burstNode.port = 8125;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                NetworkService,
            ]
        });

        httpMock = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', inject([NetworkService], (service: NetworkService) => {
            expect(service).not.toBeNull();
        })
    );

    describe('latency', () => {
        it('should return a number representing a latency', (done) => {
            inject([NetworkService], (service: NetworkService) => {
                const response = service.latency(burstNode).then(resp => {
                    expect(resp).toBeGreaterThan(150);
                    done();
                });
                const request = httpMock.expectOne('https://node.burst.com:8125/burst');
                expect(request.request.method).toBe('GET');
                setTimeout(() => {
                    // simulate a latency
                    request.flush({foo: 'bar'});
                }, 150)
            }).call(null)
        });

        it('should throw an error on timeout', (done) => {
            const url = burstNode.toUrl();
            inject([NetworkService], (service: NetworkService) => {
                const response = service.latency(burstNode, 200).catch(e => {
                    expect(e.toString()).toBe(`Connection [${url}] timed out!`);
                    done();
                });
                const request = httpMock.expectOne(url);
                expect(request.request.method).toBe('GET');
                setTimeout(() => {
                    // simulate a latency
                    request.flush({foo: 'bar'});
                }, 300)
            }).call(null)
        })
    });

});
