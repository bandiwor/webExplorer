window.addEventListener('load', () => {
    const searchModal = document.querySelector('#search-modal');
    const searchInput = document.querySelector('#search-input');
    const files = document.querySelector('#files');
    let searchText = '';

    if (!(searchInput || searchInput || files)) {
        return;
    }

    function updateFiles(filter) {
        files.querySelectorAll('a.file').forEach(file => {
            const filename = file.dataset?.['filename'];
            if (filename) {
                if (filename.toLowerCase().replaceAll(' ', '').includes(filter)) {
                    file.style.display = 'flex';
                } else {
                    file.style.display = 'none';
                }
            }
        })
    }

    window.addEventListener('keydown', e => {
        if (!searchText && e.code.toLowerCase() === 'space') {
            e.preventDefault();
            return;
        }

        if (!e.ctrlKey) {
            if (e.key.toLocaleLowerCase() === 'backspace') {
                if (searchText) {
                    searchText = searchText.slice(0, -1);
                }
            } else {
                if (e.key.length > 1) {
                    return;
                }
                searchText += e.key;
            }
            searchInput.value = searchText;

            if (searchText === '') {
                searchModal.style.display = 'none';
            } else {
                searchModal.style.display = 'flex';
            }

            updateFiles(searchText);
        }
    })
})