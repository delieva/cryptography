import wordninja
import concurrent.futures

import numpy as np
import pandas as pd

from tqdm import tqdm
from bisect import bisect_left
from itertools import permutations
from collections import Counter, defaultdict
from typing import Dict, List, Sequence


small_letters        = 'abcdefghijklmnopqrstuvwxyz'
all_case_letters     = set(small_letters) | set(small_letters.upper())
n_gram_sizes         = (1, 2, 3, 4, 5, 6)
words_frequency_file = 'enwiki-20150602-words-frequency.txt'
popular_symbols      = 'etaoinsrhdluc'


def substitution_cipher_decoder(text: str, decode_dicts: List[Dict[str, str]]) -> str:
    result = [
        [decode_dict.get(x, '?') for x in text[ix::len(decode_dicts)]]
        for ix, decode_dict in enumerate(decode_dicts)
    ]
    return ''.join([
        ''.join(txt) for txt in zip(*result)
    ])


def load_n_grams(file: str, sep: str = ' ', n_grams: Sequence[int] = n_gram_sizes, limit: int = None) -> Dict[str, float]:
    word_frequency = pd.read_csv(file, sep=sep, header=None, nrows=limit)

    word_frequency.fillna(' ', inplace=True)
    word_frequency[0] = word_frequency[0].map(str.lower)
    word_frequency[1] = word_frequency[1] / word_frequency[1].sum()

    grams_sums  = defaultdict(float)
    grams_count = defaultdict(int)
    for _, (word, prob) in tqdm(word_frequency.iterrows(), total=len(word_frequency), desc='Load', position=0):
        for k_gram in n_grams:
            for i in range(len(word) - k_gram + 1):
                key = word[i:(i + k_gram)]

                if not all(x in all_case_letters for x in key):
                    continue
                grams_sums[key]  += prob
                grams_count[key] += 1
    return {
        k: grams_sums[k] / grams_count[k]
        for k in grams_count.keys()
    }


def substitution_decode_score(text: str, n_grams: Sequence[int], grams_prob: Dict[str, float]):
    score = 0.
    for t, k_gram in enumerate(n_grams):
        for i in range(len(text) - k_gram + 1):
            score += grams_prob.get(text[i:(i + k_gram)], 0.0)
    return score


def init_mapping() -> Dict[str, str]:
    decodeset = set(small_letters)
    mapping = {}
    for c in set(small_letters):
        decode = np.random.choice(list(decodeset))
        decodeset.remove(decode)
        mapping[c] = decode
    return mapping


def update_mapping(mapping: Dict[str, str], key: str, new_value: str) -> Dict[str, str]:
    value_key = None
    for k, value in mapping.items():
        if value == new_value:
            value_key = k
            break
    if value_key is not None:
        mapping[key], mapping[value_key] = mapping[value_key], mapping[key]
    return mapping


def update_mapping(mapping, key, new_value):
    value_key = [k for k, v in mapping.items() if v == new_value][0]
    mapping[key], mapping[value_key] = mapping[value_key], mapping[key]

    return mapping


def init_population(text: str, n_popular_symbols: int = 7) -> List[Dict[str, str]]:
    n_popular_symbols = min(n_popular_symbols, len(popular_symbols))
    _popular_symbols = popular_symbols[:n_popular_symbols]
    popular_symbols_combinations = [
        ''.join(p)
        for p in permutations(_popular_symbols)
    ]
    popular_symbols_in_text = ''.join([
        x[0]
        for x in sorted(Counter(text).items(), key=lambda x: -x[-1])
    ])[:n_popular_symbols]

    population = [
        init_mapping()
        for _ in range(len(popular_symbols_combinations))
    ]
    for index in range(len(population)):
        for c1, c2 in zip(popular_symbols_in_text, popular_symbols_combinations[index]):
            update_mapping(mapping=population[index], key=c1, new_value=c2)

    return population


def softmax_score(x: List[float]) -> np.ndarray:
    x = np.array(x)
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=0)


def crossover(dicts, scores, population_size):
    probas = softmax_score(scores)
    probas = np.cumsum(probas)
    population = []

    for _ in range(population_size):
        # get parents based on scores
        x, y = dicts[bisect_left(probas, np.random.rand())], dicts[bisect_left(probas, np.random.rand())]
        child = x.copy()

        for k in child.keys():
            update_mapping(child, k, np.random.choice([x, y])[k])

        population.append(child)

    return population


def mutate(dicts: List[Dict[str, str]], mutation_prob: float = 0.25) -> List[Dict[str, str]]:
    for i in range(len(dicts)):
        while np.random.rand() < mutation_prob:
            key       = np.random.choice(list(small_letters))
            new_value = np.random.choice(list(small_letters))
            update_mapping(mapping=dicts[i], key=key, new_value=new_value)
    return dicts


def process_dynamic_population(text, dynamic_index, populations, best_dicts, n_grams_size, grams_prob, crossover_coef, mutation_prob):
    dynamic_population = populations[dynamic_index]

    scores = [
        substitution_decode_score(
            text       = substitution_cipher_decoder(text       = text,
                                                     decode_dicts = best_dicts[:dynamic_index] +
                                                                    [decode_dict, ] +
                                                                    best_dicts[dynamic_index + 1:]
                                                     ),
            n_grams    = n_grams_size,
            grams_prob = grams_prob,
        )
        for decode_dict in dynamic_population
    ]
    indexes = np.argsort(scores)

    new_best_score = scores[indexes[-1]]
    new_best_dict = dynamic_population[indexes[-1]]

    indexes = indexes[int(len(scores) * crossover_coef):]
    new_population = crossover(
        dicts           = [dynamic_population[i] for i in indexes],
        scores          = [scores[i] for i in indexes],
        population_size = len(dynamic_population),
    )
    new_population = mutate(dicts=new_population, mutation_prob=mutation_prob)

    return dynamic_index, new_best_score, new_best_dict, new_population


def genetic_algo(
        text              : str,
        n_popular_symbols : int,
        n_grams_size      : Sequence[int],
        grams_prob        : Dict[str, float],
        mutation_prob     : float = 0.25,
        early_stopping    : int   = 50,
        crossover_coef    : float = 0.75,
        max_iterations    : int   = 500,
) -> List[Dict[str, str]]:
    e_stop_counter = early_stopping

    populations = None
    best_dicts  = None
    best_scores = None

    new_populations = [
        init_population(text=text, n_popular_symbols=n_popular_symbols)
        for _ in range(4)
    ]
    new_best_dicts  = [population[0] for population in new_populations]
    new_best_scores = [-1 for _ in range(len(new_populations))]

    for _ in tqdm(range(max_iterations), desc='Decoding', total=max_iterations, position=0):

        populations = new_populations
        best_dicts  = new_best_dicts
        best_scores = new_best_scores

        new_populations = []
        new_best_dicts  = []
        new_best_scores = []

        with concurrent.futures.ProcessPoolExecutor(max_workers=len(populations)) as executor:
            futures = [
                executor.submit(
                    process_dynamic_population,
                    text           = text,
                    dynamic_index  = dynamic_index,
                    populations    = populations,
                    best_dicts     = best_dicts,
                    n_grams_size   = n_grams_size,
                    grams_prob     = grams_prob,
                    crossover_coef = crossover_coef,
                    mutation_prob  = mutation_prob
                )
                for dynamic_index in range(len(populations))
            ]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
            results = {
                dynamic_index: (new_population, new_best_dict, new_best_score)
                for dynamic_index, new_best_score, new_best_dict, new_population in results
            }
        new_populations = [results[i][0] for i in range(len(populations))]
        new_best_dicts  = [results[i][1] for i in range(len(populations))]
        new_best_scores = [results[i][2] for i in range(len(populations))]

        if all([new_best_scores[ix] <= best_scores[ix] for ix in range(len(best_scores))]):
            if e_stop_counter == 0:
                print(f'Early stopping!')
                break
            else:
                e_stop_counter -= 1
        else:
            _patience = early_stopping

    return best_dicts


def main():
    grams_prob = load_n_grams(file=words_frequency_file, sep=' ', n_grams=n_gram_sizes, limit=None)

    encrypted_text = 'KZBWPFHRAFHMFSNYSMNOZYBYLLLYJFBGZYYYZYEKCJVSACAEFLMAJZQAZYHIJFUNHLCGCINWFIHHHTLNVZLSHSVOZDPYSMN' \
                     'YJXHMNODNHPATXFWGHZPGHCVRWYSNFUSPPETRJSIIZSAAOYLNEENGHYAMAZBYSMNSJRNGZGSEZLNGHTSTJMNSJRESFRPGQP' \
                     'SYFGSWZMBGQFBCCEZTTPOYNIVUJRVSZSCYSEYJWYHUJRVSZSCRNECPFHHZJBUHDHSNNZQKADMGFBPGBZUNVFIGNWLGCWSAT' \
                     'VSSWWPGZHNETEBEJFBCZDPYJWOSFDVWOTANCZIHCYIMJSIGFQLYNZZSETSYSEUMHRLAAGSEFUSKBZUEJQVTDZVCFHLAAJSF' \
                     'JSCNFSJKCFBCFSPITQHZJLBMHECNHFHGNZIEWBLGNFMHNMHMFSVPVHSGGMBGCWSEZSZGSEPFQEIMQEZZJIOGPIOMNSSOFWS' \
                     'KCRLAAGSKNEAHBBSKKEVTZSSOHEUTTQYMCPHZJFHGPZQOZHLCFSVYNFYYSEZGNTVRAJVTEMPADZDSVHVYJWHGQFWKTSNYHT' \
                     'SZFYHMAEJMNLNGFQNFZWSKCCJHPEHZZSZGDZDSVHVYJWHGQFWKTSNYHTSZFYHMAEDNJZQAZSCHPYSKXLHMQZNKOIOKHYMKK' \
                     'EIKCGSGYBPHPECKCJJKNISTJJZMHTVRHQSGQMBWHTSPTHSNFQZKPRLYSZDYPEMGZILSDIOGGMNYZVSNHTAYGFBZZYJKQELS' \
                     'JXHGCJLSDTLNEHLYZHVRCJHZTYWAFGSHBZDTNRSESZVNJIVWFIVYSEJHFSLSHTLNQEIKQEASQJVYSEVYSEUYSMBWNSVYXEI' \
                     'KWYSYSEYKPESKNCGRHGSEZLNGHTSIZHSZZHCUJWARNEHZZIWHZDZMADNGPNSYFZUWZSLXJFBCGEANWHSYSEGGNIVPFLUGCE' \
                     'UWTENKCJNVTDPNXEIKWYSYSFHESFPAJSWGTYVSJIOKHRSKPEZMADLSDIVKKWSFHZBGEEATJLBOTDPMCPHHVZNYVZBGZSCHC' \
                     'EZZTWOOJMBYJSCYFRLSZSCYSEVYSEUNHZVHRFBCCZZYSEUGZDCGZDGMHDYNAFNZHTUGJJOEZBLYZDHYSHSGJMWZHWAFTIAA' \
                     'Y'.lower()
    decode_set = genetic_algo(
        text               = encrypted_text,
        n_grams_size       = n_gram_sizes,
        grams_prob         = grams_prob,
        n_popular_symbols  = 6,
        mutation_prob      = 0.25,
        early_stopping     = 75,
        crossover_coef     = 0.75,
        max_iterations     = 200,
    )
    decoded_text = " ".join(wordninja.split(substitution_cipher_decoder(text=encrypted_text, decode_dicts=decode_set)))
    print(f'Best decode: {decoded_text}')


if __name__ == '__main__':
    main()
