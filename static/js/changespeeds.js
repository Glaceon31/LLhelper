function changespeeds()
{
    switch (document.getElementById("diffchoice").value)
    {
        case "easy":
            document.getElementById("speeds")[1].selected = true;
            break;
        case "normal":
            document.getElementById("speeds")[3].selected = true;
            break;
        case "hard":
            document.getElementById("speeds")[5].selected = true;
            break;
        case "expert":
            document.getElementById("speeds")[7].selected = true;
            break;
        case "master":
            document.getElementById("speeds")[8].selected = true;
            break;
    }
}