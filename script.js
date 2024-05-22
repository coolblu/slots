$(document).ready(function() {
    const items = [
        '🍭', '❌', '⛄️', '🦄', '🍌'
    ];
    const doors = $('.door');
    let credits = 100;
    let betSize = 10;
    let isSpinning = false; // Flag to track if a spin is happening
    let fastRolls = false;
    const payTable = {
        '🍭': 5,
        '❌': 2,
        '⛄️': 3,
        '🦄': 10,
        '🍌': 1
    };

    $('#spinner').click(function() {
        console.log('Spin button clicked');
        if (isSpinning) {
            console.log('Already spinning, please wait...');
            return;
        }
        if (betSize == 0) {
            alert('Please place a bet!');
        }
        else if (credits >= betSize) {
            credits -= betSize; // Deduct the cost to play
            updateCredits();
            spin();
        } else {
            alert('Not enough credits!');
        }
    });

    $('#reseter').click(function() {
        console.log('Reset button clicked');
        credits = 100;
        updateCredits();
        init(true);
    });

    $('#betSize').change(function() {
        betSize = parseInt($(this).val(), 10);
        console.log('Bet size changed to:', betSize);
    });

    $('#speedSwitch').change(function() {
        fastRolls = $(this).is(':checked');
        console.log('Fast rolls:', fastRolls);
    });

    function updateCredits() {
        $('#creditAmount').text(credits);
    }

    function init(firstInit = true, groups = 1, duration = 1) {
        console.log('Initializing...');
        doors.each(function() {
            const door = $(this);
            if (firstInit) {
                door.data('spinned', '0');
            }

            const boxes = door.find('.boxes');
            const boxesClone = boxes.clone().empty();
            const pool = ['❓'];

            if (!firstInit) {
                const arr = [];
                for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
                    arr.push(...items);
                }
                pool.push(...shuffle(arr));

                boxesClone.on('transitionstart', function() {
                    door.data('spinned', '1');
                    boxesClone.find('.box').css('filter', 'blur(1px)');
                });

                boxesClone.on('transitionend', function() {
                    boxesClone.find('.box').css('filter', 'blur(0)');
                    boxesClone.find('.box:gt(0)').remove();
                    door.data('spinned', '0'); // Allow spinning again
                });
            }

            for (let i = pool.length - 1; i >= 0; i--) {
                const box = $('<div class="box"></div>');
                box.css({
                    width: door.width(),
                    height: door.height()
                }).text(pool[i]);
                boxesClone.append(box);
            }

            boxesClone.css({
                transitionDuration: `${duration > 0 ? duration : 1}s`,
                transform: `translateY(-${door.height() * (pool.length - 1)}px)`
            });
            boxes.replaceWith(boxesClone);
        });
    }

    async function spin() {
        console.log('Spinning...');
        isSpinning = true; // Set the spinning flag to true
        const duration = fastRolls ? 0.5 : 2; // Adjust duration based on fast rolls switch
        init(false, 1, duration);

        const results = [];
        for (const door of doors) {
            const boxes = $(door).find('.boxes');
            console.log('Box duration:', duration);
            boxes.css('transform', 'translateY(0)');
            await new Promise(resolve => setTimeout(resolve, duration * 1000));
            const result = boxes.find('.box').first().text();
            console.log('Result:', result);
            results.push(result);
        }
        evaluateResults(results);
        isSpinning = false; // Reset the spinning flag after the spin completes
    }

    function evaluateResults(results) {
        console.log('Evaluating results:', results);
        const counts = {};
        for (const result of results) {
            counts[result] = (counts[result] || 0) + 1;
        }

        for (const [item, count] of Object.entries(counts)) {
            if (count === 3 && payTable[item]) {
                const winnings = betSize * payTable[item];
                credits += winnings;
                updateCredits();
                alert(`You won ${winnings} credits!`);
                return;
            }
        }
    }

    function shuffle(arr) {
        let m = arr.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);
            [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        return arr;
    }

    updateCredits();
    init();
});
