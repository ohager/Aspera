import {inject, TestBed} from '@angular/core/testing';
import {LoggerService} from '../logger.service';
import {environment} from '../../../../environments/environment'

describe('LoggerService', () => {
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = jest.spyOn(global.console, 'log');
        TestBed.configureTestingModule({
            providers: [
                LoggerService,
            ]
        });
    });

    afterEach(() => {
        consoleSpy.mockClear()
    });

    it('should be created', inject([LoggerService], (service: LoggerService) => {
            expect(service).not.toBeNull();
        })
    );

    it('should log, if environment is not silent', inject([LoggerService], (service: LoggerService) => {
            environment.silent = false;
            service.log('Test', 'Some message');
            expect(consoleSpy).toHaveBeenCalled();
        })
    );

    it('should not log, if environment is silent', inject([LoggerService], (service: LoggerService) => {
            environment.silent = true;
            const spy = jest.spyOn(global.console, 'log');
            service.log('Test', 'Some message');
            expect(spy).not.toHaveBeenCalled();
        })
    );
});
