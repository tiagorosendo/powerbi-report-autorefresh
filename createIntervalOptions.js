import { options } from './options.js'
import { getById } from './utils.js'

let page = getById('options')

const constructOptions = () =>  {
    for (let item of options) {
        let input = document.createElement('input');

        if(item.Id == 1)
            input.setAttribute('checked', 'true')
        
        input.setAttribute('id', item.Id)
        input.setAttribute('type', 'radio')
        input.setAttribute('name', 'radioValue')
        input.setAttribute('value', item.Value)

        input.addEventListener('click', function () {
            chrome.storage.sync.set({
                interval: item.Value
            }, function () {
                console.log('interval is ' + item.Value);
            })
        });

        let label = document.createElement('label');
        label.setAttribute('for', item.Id)
        label.setAttribute('id', 'label' + item.Id)
        label.innerHTML = item.Description


        page.appendChild(input);
        page.appendChild(label);

    }
}

export {constructOptions}