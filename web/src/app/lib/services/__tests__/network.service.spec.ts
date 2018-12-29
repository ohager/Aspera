import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

import {NetworkService} from '../network.service';

describe('NetworkService', () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                NetworkService,
            ]
        });
    });

    it('should be created', inject([NetworkService], (service: NetworkService) => {
            expect(service).not.toBeNull();
        })
    );
});
