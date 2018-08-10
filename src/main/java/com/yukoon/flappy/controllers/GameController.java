package com.yukoon.flappy.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GameController {
    //首页直接前往游戏界面

    @GetMapping("/flappy")
    public String toFlappy() {
        return "flappy_cat";
    }
}
