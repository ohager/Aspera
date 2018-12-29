/*
* Copyright 2018 PoC-Consortium
*/

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/timeout'

import {BurstNode, constants} from '../model';
import {NoConnectionError} from '../model/error';
import {Observable} from 'rxjs';

/**
 * NetworkService class
 *
 * Doing network stuff
 * @FIXME check its usage! it's not used yet - do we need this?
 */
@Injectable()
export class NetworkService {

    constructor(
        private http: HttpClient
    ) {
    }

    public latency(node: BurstNode, timeout: number = constants.connectionTimeout): Promise<number> {
        const timeStart: number = performance.now();
        const url = node.toUrl();
        return this.http.get(url)
            .timeout(timeout)
            .toPromise()
            .then(response => {
                let timeEnd: number = performance.now();
                return (timeEnd - timeStart);
            }).catch(e => {
                throw new NoConnectionError(`Connection [${url}] timed out!`)
            });
    }

}
