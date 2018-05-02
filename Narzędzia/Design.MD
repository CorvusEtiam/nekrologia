# Budowa strony Desktop

* Lewy pasek z wyborem nazwisk
* Prawy wysuwany z opisem osoby
* Główny moduł mapy 
* Menu w górnym prawym rogu


# Budowa strony mobilnej

* Wysuwane menu w górnej części
* Lista wyboru
* W momencie wyboru mapa na cały ekran + pasek otwierający menu boczne + listę wyboru u góry

```css

.mobile.full.navbar {}
.mobile.left.navbar {}
.mobile.right.navbar {}

```
## Na mały ekran
```text



________________
# Lista | Menu #
################
#              #
#              #  
#              #
#  Mapa        #
#              #
#              #
#              #
#              #
################

________________
#     Menu     #
################
#   Nazwisko   #
#   Nazwisko   #
#   Nazwisko   #
#   Nazwisko   #
#   Nazwisko   #
#   Nazwisko   #
################

Przesuń w lewo by wysunąć listę. 


```

## Tablet 

Przesuń w lewo, by odsłonić listę nazwisk.
Podobnie, jak desktop. 
Dodatkowa obsługa `ontouchdown`

W telefonie. Kolumny zostają przestawione w z 
