# Sort 알고리즘 노트

다른 위치에 있는 sort.md 파일입니다.

## 추가 정보
- Quick Sort의 평균 시간복잡도: O(n log n)
- Merge Sort는 항상 O(n log n) 보장
- STL sort는 일반적으로 Introsort 사용

## 예제
```cpp
// 내림차순 정렬
sort(v.begin(), v.end(), greater<int>());

// 커스텀 비교 함수
sort(v.begin(), v.end(), [](int a, int b) {
    return a > b; // 내림차순
});
```
